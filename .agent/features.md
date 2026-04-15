# Features

## JSON to Dart Conversion
- **Smart Model Generation**: Automatically convert JSON objects into well-structured Dart classes.
- **Deeply Nested Support**: Recursively identifies and generates separate classes for nested objects and arrays, ensuring a clean and modular codebase.
- **Type Inference**: Intelligently detects Dart types from JSON values (int, double, String, bool, List, and Map).

## Coding Styles & Customization
- **Multiple Boilerplate Styles**:
  - **Manual**: Traditional constructor and `fromJson` method implementation.
  - **Factory**: Uses modern factory constructors for `fromJson`.
- **Serialization Control**: Toggle the inclusion of `fromJson` and `toJson` methods as needed.
- **Custom Naming**: Define your own root class name.
- **Class Prefixes**: Add a custom prefix (e.g., `ApiUser`) to all generated classes to avoid name collisions.
- **Automatic Case Conversion**: Converts JSON keys (snake_case, kebab-case) into valid Dart PascalCase class names and camelCase fields.

## Developer Experience (DX)
- **Monaco Editor Integration**: Features a powerful, VS Code-like coding environment with syntax highlighting and smart indentation.
- **Dark Mode UI**: A premium, high-contrast dark theme optimized for long development sessions.
- **One-Click Copy**: Instantly copy the generated Dart code to your clipboard.
- **Instant Preview**: Real-time generation as you tweak settings or input JSON.
- **Responsive Layout**: Seamlessly works on various screen sizes, from desktop to mobile.

## Security & Reliability
- **Local Processing**: JSON data is processed locally in the browser, ensuring your data remains private.
- **Strict Content Protection**: Restricts right-click access to prevent accidental menu triggers and protect the UI integrity.
