/**
 * Identifier casing. Pure string functions — no DOM, no state.
 */

export function toPascalCase(str) {
  return String(str)
    .replace(/[_-](.)/g, (_, c) => c.toUpperCase())
    .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase());
}

export function toCamelCase(str) {
  const pascal = toPascalCase(
    String(str)
      .replace(/[^a-zA-Z0-9_ -]/g, " ")
      .replace(/_/g, " ")
  );
  return pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : "value";
}

export function toSnakeCase(str) {
  return String(str)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-zA-Z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

/** A JSON key turned into a legal Dart field name. */
export function toFieldName(key) {
  let fieldName = toCamelCase(key);
  if (/^\d/.test(fieldName)) fieldName = `field${fieldName}`;
  return fieldName || "value";
}
