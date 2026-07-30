import { DEFAULT_CLASS_NAME } from "../config.js";
import { DartModelBuilder } from "./builder.js";
import { toPascalCase } from "./naming.js";

export { toPascalCase, toSnakeCase, toCamelCase, toFieldName } from "./naming.js";

/**
 * The generator's public API. Takes plain data, returns a string plus counts.
 * Knows nothing about editors, storage or the DOM — which is what makes it
 * straightforward to reason about and to test.
 *
 * @param {object}  options
 * @param {unknown} options.json             already-decoded JSON
 * @param {string}  [options.className]       root class name, before casing
 * @param {boolean} [options.includeFromJson]
 * @param {boolean} [options.includeToJson]
 * @param {string}  [options.prefix]          "" means no prefix
 * @returns {{code: string, rootClassName: string, classCount: number,
 *            fieldCount: number, lineCount: number}}
 */
export function generateDartModels({
  json,
  className = "",
  includeFromJson = true,
  includeToJson = true,
  prefix = "",
} = {}) {
  // The root class is named from the Class field as typed; the prefix applies
  // only to the nested classes the builder discovers.
  const rootClassName = toPascalCase(
    String(className || "").trim() || DEFAULT_CLASS_NAME
  );

  const builder = new DartModelBuilder({ prefix, includeFromJson, includeToJson });

  return { rootClassName, ...builder.build(rootClassName, json) };
}
