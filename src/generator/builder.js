import { toFieldName, toPascalCase } from "./naming.js";

/**
 * Turns a decoded JSON value into Dart model classes.
 *
 * Pure: no DOM, no storage, no globals. Construct one per generation run —
 * instances accumulate discovered classes and are not reusable.
 *
 * Discovery is breadth-first. Rendering a class can reveal new nested classes,
 * which get appended to #classes and picked up by the queue in build().
 *
 * ORDERING NOTE — do not reorder #renderClass:
 * the fromJson block resolves nested class names WITHOUT registering them
 * (#resolveClassName), while the field block registers them (#typeFor). Both
 * derive the same name from the same map state, so they agree. Emitting the
 * field block first would register names earlier and shift the collision
 * counter, renaming classes like Meta1.
 */
export class DartModelBuilder {
  #prefix;
  #includeFromJson;
  #includeToJson;

  /** class name -> the JSON object it was derived from, in discovery order */
  #classes = new Map();
  #processed = new Set();

  constructor({ prefix = "", includeFromJson = true, includeToJson = true } = {}) {
    const trimmed = String(prefix || "").trim();
    this.#prefix = trimmed ? toPascalCase(trimmed) : "";
    this.#includeFromJson = includeFromJson;
    this.#includeToJson = includeToJson;
  }

  /**
   * @returns {{code: string, classCount: number, fieldCount: number, lineCount: number}}
   */
  build(rootClassName, json) {
    this.#classes.set(rootClassName, json);

    const queue = [rootClassName];
    let output = "";

    while (queue.length > 0) {
      const name = queue.shift();
      if (this.#processed.has(name)) continue;
      this.#processed.add(name);

      const obj = this.#classes.get(name);
      if (!isPlainObject(obj)) continue;

      output += this.#renderClass(name, obj) + "\n";

      // Rendering may have discovered new classes — queue whatever is unseen.
      for (const discovered of this.#classes.keys()) {
        if (!this.#processed.has(discovered)) queue.push(discovered);
      }
    }

    const code = output.trimEnd();

    let fieldCount = 0;
    for (const name of this.#processed) {
      const obj = this.#classes.get(name);
      if (isPlainObject(obj)) fieldCount += Object.keys(obj).length;
    }

    return {
      code,
      classCount: this.#processed.size,
      fieldCount,
      lineCount: code ? code.split("\n").length : 0,
    };
  }

  // ── naming ───────────────────────────────────────────────────────────────

  #baseClassName(key, isArrayItem) {
    const base = this.#prefix + toPascalCase(key);
    return isArrayItem ? `${base}Item` : base;
  }

  /**
   * Pick a free class name for `value`. Reuses an existing name when that class
   * was built from the same set of keys, otherwise appends a counter.
   */
  #uniqueClassName(baseName, value) {
    let className = baseName;
    let counter = 1;

    while (this.#classes.has(className)) {
      const existingKeys = Object.keys(this.#classes.get(className) || {}).sort().join(",");
      const incomingKeys = Object.keys(value || {}).sort().join(",");
      if (existingKeys === incomingKeys) return className;

      className = `${baseName}${counter}`;
      counter += 1;
    }

    return className;
  }

  /** Resolve a nested class name without registering it. */
  #resolveClassName(key, value, isArrayItem) {
    return this.#uniqueClassName(this.#baseClassName(key, isArrayItem), value);
  }

  // ── types ────────────────────────────────────────────────────────────────

  /** Dart type for a value, registering any nested class it implies. */
  #typeFor(key, value, isArrayItem = false) {
    if (value === null || value === undefined) return "dynamic";
    if (typeof value === "string") return "String";
    if (typeof value === "boolean") return "bool";
    if (typeof value === "number") return Number.isInteger(value) ? "int" : "double";

    if (Array.isArray(value)) {
      if (value.length === 0) return "List<dynamic>";
      return `List<${this.#typeFor(key, value[0], true)}>`;
    }

    if (typeof value === "object") {
      const className = this.#resolveClassName(key, value, isArrayItem);
      if (!this.#classes.has(className)) this.#classes.set(className, value);
      return className;
    }

    return "dynamic";
  }

  // ── expressions ──────────────────────────────────────────────────────────

  #fromJsonExpr(key, value) {
    const read = `json['${key}']`;

    if (value === null || value === undefined) return read;
    if (typeof value === "string") return `${read} as String?`;
    if (typeof value === "boolean") return `${read} as bool?`;
    if (typeof value === "number") {
      return `${read} as ${Number.isInteger(value) ? "int" : "double"}?`;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) return `${read} as List<dynamic>?`;

      const first = value[0];
      const castList = (type) =>
        `(${read} as List<dynamic>?)?.map((e) => e as ${type}).toList()`;

      if (typeof first === "string") return castList("String");
      if (typeof first === "number") {
        return castList(Number.isInteger(first) ? "int" : "double");
      }
      if (typeof first === "boolean") return castList("bool");

      if (isPlainObject(first)) {
        const className = this.#resolveClassName(key, first, true);
        return (
          `(${read} as List<dynamic>?)\n` +
          `        ?.map((e) => ${className}.fromJson(e as Map<String, dynamic>))\n` +
          `        .toList()`
        );
      }

      return `${read} as List<dynamic>?`;
    }

    if (typeof value === "object") {
      const className = this.#resolveClassName(key, value, false);
      return (
        `${read} != null\n` +
        `        ? ${className}.fromJson(${read} as Map<String, dynamic>)\n` +
        `        : null`
      );
    }

    return read;
  }

  #toJsonExpr(fieldName, value) {
    if (Array.isArray(value) && value.length > 0 && isObjectLike(value[0])) {
      return `${fieldName}?.map((e) => e.toJson()).toList()`;
    }
    if (isPlainObject(value)) return `${fieldName}?.toJson()`;
    return fieldName;
  }

  // ── rendering ────────────────────────────────────────────────────────────

  #renderClass(className, obj) {
    const keys = Object.keys(obj);
    const fieldNames = new Map(keys.map((key) => [key, toFieldName(key)]));

    const lines = [`class ${className} {`, `  ${className}({`];
    for (const key of keys) lines.push(`    this.${fieldNames.get(key)},`);
    lines.push(`  });`);

    // Must come before the field block — see the ordering note on this class.
    if (this.#includeFromJson) {
      lines.push(``, `  ${className}.fromJson(Map<String, dynamic> json) {`);
      for (const key of keys) {
        lines.push(`    ${fieldNames.get(key)} = ${this.#fromJsonExpr(key, obj[key])};`);
      }
      lines.push(`  }`);
    }

    lines.push(``);
    for (const key of keys) {
      lines.push(`  ${this.#typeFor(key, obj[key])}? ${fieldNames.get(key)};`);
    }

    if (this.#includeToJson) {
      lines.push(``, `  Map<String, dynamic> toJson() {`, `    return {`);
      for (const key of keys) {
        lines.push(`      '${key}': ${this.#toJsonExpr(fieldNames.get(key), obj[key])},`);
      }
      lines.push(`    };`, `  }`);
    }

    lines.push(`}`);
    return lines.join("\n") + "\n";
  }
}

/** An object we can generate a class from — not null, not an array. */
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Any non-null object, arrays included. */
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
