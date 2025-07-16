### React-Component-Graphify

Visualize the component structure of your React project — see how components are connected, where they're imported, how they're structured, and more — with rich CLI support and automatic file watching.

[![npm](https://img.shields.io/npm/v/react-component-graphify)](https://www.npmjs.com/package/react-component-graphify) ![NPM Downloads](https://img.shields.io/npm/dw/react-component-graphify)

---

### `#` Features

- **Folder-based Tree Structure generation :** Visualizes your React component directory as a hierarchical tree.

- **Component-level Import tracing with line numbers :** Shows where components are imported and on which line.

- **Search CLI to find usage, export type, size, props, and more :** Run powerful queries directly from the terminal.

- **Ignores Commented Imports of Components :** Ensures only active, real imports are considered.

- **Automatic updates on file changes :** Uses `chokidar` to regenerate the graph when you edit components.

- **Generates readable `.txt` output :** Saves the structured report under `src/graphify/componentsTree.txt`.

- **Detects props, unused (dead) components, and export types :** Quickly identify how components are structured and utilized.

- **Zero-configuration setup :** Works out of the box—just install and run.

- **Supports short and long CLI modes :** Use either `i` or `imp`, `a` or `all`, etc., for flexible command usage.

---

### `#` How It Works (Output Text File Generation)

When you run `npx react-component-graphify`, the tool performs the following steps to generate a structured `.txt` file that visually maps your React component hierarchy and import relationships:

- **Scans the `src/` Directory :**
  Recursively reads all JavaScript and TypeScript files (`.js`, `.jsx`, `.ts`, `.tsx`) inside your `src/` directory.

- **Identifies React Components :**
  Files with names starting with a capital letter are treated as React component files. This is based on the convention that Component names begin with uppercase letters (e.g., `App.jsx`, `LoginForm.tsx`).

- **Parses Import Statements :**
  Each component file is analyzed to extract valid import statements using a robust parser that ignores commented-out lines. For each import:

  - It checks whether the imported component is a local component.

  - If so, it records the imported component name and the line number where the Import occurs.

- **Builds a Component Tree :**
  A nested object is constructed that represents your folder structure, component files, and the components they import. This data structure forms the backbone of the visual output.

- **Renders a Visual Tree View :**
  The collected structure is converted into a formatted tree with:

  - Folders displayed hierarchically

  - Components marked with their file names

  - Imported components listed underneath with the line number they appear on

- **Outputs to `src/graphify/componentsTree.txt` :**
  The entire visual tree is written to a human-readable `.txt` file. This file includes a custom header with usage instructions and a searchable structure.

---

### `#` Installation

Install the package `react-component-graphify` with [npm](https://www.npmjs.com/)

```bash
npm i react-component-graphify
```

---

### `#` Run the Package

To run the package manually, run the below command

```bash
npx react-component-graphify
```

To **run the package automatically** when you start your project, first install the package `concurrently` with npm

```bash
npm i concurrently --save-dev
```

Then simply **add this script** in your project's `package.json` file

```javascript
// your other code...
"scripts": {
      "start": "concurrently \"vite" \"npx react-component-graphify\""
      // your other code...
}
// your other code...
```

Replace `vite` with `"react-scripts start"` or whatever your React app uses to run, if you're not using Vite.

---

### `#` Output

On running the package it will generate a output text file in `src/graphify` folder. The structure will look like this

```text
your-project/
├── node_modules/
├── public/
├── src/
|   └── graphify/                        <-- 📁 Output folder
│       └── componentsTree.txt           <-- 📄 Main output file
├── package.json
└── ...
```

The output text file will contain a clean, folder-wise, **tree structure of Components with all the Imports Component with line number**. The output format of the `componentsTree.txt` will look like this

```text
└── 📁 src
    ├── 📦 App.jsx
    │   ├── Header.jsx           ← line 3
    │   └── Footer.jsx           ← line 10
    │
    └── 📁 components
        |
        ├── 📦 Header.jsx
        ├── 📦 Footer.jsx
        └── 📦 Sidebar.jsx
            └── Navigation.jsx   ← line 5
```

---

### `#` CLI Usage Techniques

After installing the package, you can run **CLI commands to inspect Individual Components** like this

```bash
graphify search <ComponentName> [mode]
```

To know how to use `CLI Commands` or to know about all the `Modes` run the below Command

```bash
graphify help
```

**Note :** `<ComponentName>` is Case-Sensitive. So give proper Component Name.

---

### `#` Available Modes

You can pass a `Mode` to control what kind of information you want to retrieve about a Component:

| Mode (Short/Long) | Description                                                                     |
| ----------------- | ------------------------------------------------------------------------------- |
| `a` / `all`       | `Full overview` → file info, imports, usage, size, props, export type           |
| `i` / `imp`       | `Import Usage` → Shows where the component is imported with line numbers        |
| `d` / `dead`      | `Dead Component Check` → Checks if the component is used (active) or not (dead) |
| `s` / `size`      | `Size and LOC` → Shows lines of code, file size, and comment statistics         |
| `e` / `exp`       | `Export Type` → Displays export type (default, named, or unknown)               |
| `p` / `props`     | `Props Used` → Lists props used inside the component                            |
| `f` / `file`      | `File Information` → Shows file type and relative file path                     |

### `#` Example Usage

To get a **Full Report** of `LoginForm.jsx` Component, use the CLI Command in the below format

```bash
# Full report for Editor component
graphify search LoginForm.jsx a
#--------------------or#--------------------
graphify search LoginForm a
#--------------------or#--------------------
graphify search LoginForm all

# Any one of this format will give a detailed report of the stated Component
# NOTE : ComponentName is CaseSensitive
```

And the `Terminal Output` will look like this

```text



────────────────────────────────────────────────────────────────
                React Component Graphify Report
────────────────────────────────────────────────────────────────

Component Analyzed           : LoginForm
Analysis Mode                : A  ←  (Full Overview)

# File Information
    • File Type              : .jsx
    • File Directory         : components/LoginForm.js

# Import Usage
    + Total imports found    : 1
    • components/App.js      ← line 32

# Dead Component Check
    • Status                 : Active (used in project)

# Size & LOC
    • Lines of code          : 2199
    • Commented lines        : 202 ---- [9.19%]
    • File size              : 89.89 KB

# Export Type
    • Type                   : Default Export

# Props Used
    + No props detected

────────────────────────────────────────────────────────────────



```

---

### `#` Why Use This Tool ?

- Easily understand component relationships in `large-scale React codebases`

- Detect `Unused (dead) Components` to keep your project clean and efficient

- Minimize `Refactoring Risks` by identifying all `Import Locations` of a component

- Save development time when debugging `Props` or restructuring folders

- Improve onboarding by offering a `Visual Map` of your component architecture

### `#` Tested On

- Node.js versions `18.x` and `20.x`
- React projects using frameworks such as `Vite`, `Create React App (CRA)`, and `Next.js`

### `#` Tips & Best Practices

- Use `graphify search <Component> all` before refactoring or removing any component.

- Run `graphify help` to view available modes and usage instructions quickly.

- Use short CLI aliases like `d`, `p`, `s` for quicker inspections during development.

- Maintain consistent component naming using **PascalCase** (e.g., `MyComponent.jsx`) to ensure accurate detection.

---

### `#` Final Words

`React-Component-Graphify` is built to simplify your React codebase analysis. Whether you're `debugging`, `refactoring`, or just `exploring`, this tool gives you immediate clarity over your component structure — all from the `command line`.

If you find it helpful, **consider starring it on GitHub** or **sharing it with fellow developers**. Contributions, suggestions, and feedback are always welcome!
