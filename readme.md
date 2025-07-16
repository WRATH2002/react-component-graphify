# 📦 React Component Graphify

Visualize the component structure of your React project — see how components are connected, which components import others, and track it all with line numbers inside a beautifully formatted tree view.

---

## 🚀 Features

- 📁 Folder-based structure tree
- 📦 Highlights all component files (starting with a capital letter)
- 📄 Displays imported components with line numbers
- ⛔ Skips commented import statements
- 📂 Auto-updates on file changes using chokidar
- ✍️ Outputs to a readable `.txt` file in a formatted, searchable structure
- 🛡️ Lightweight and zero-config

---

## 📸 Preview

```
src/
├── 📦 App.jsx
│ ├── Header.jsx ← line 3
│ └── Footer.jsx ← line 5
│
└── 📁 components
│
├── 📦 Header.jsx
├── 📦 Footer.jsx
```

---

## 🧠 How It Works

- Scans the `src/` directory for all `.js`, `.jsx`, `.ts`, `.tsx` files.
- Identifies components by filenames starting with an uppercase letter.
- Tracks component imports (excluding commented-out ones).
- Generates a structured tree with line numbers.
- Auto-watches files for changes and updates output.

---

## 📦 Installation

```bash
npm install --save-dev react-component-graphify
```

## ⚙️ Usage

To manually run the component graph builder:

```bash
npx react-component-graphify
```

This will generate a file:

```bash
/src/graphify/componentsTree.txt
```

## ⚡ Auto Run on Project Start (Optional)

Add this to your package.json scripts to auto-run with your project:

```json
"scripts": {
  "start": "react-component-graphify && react-scripts start"
}
```
