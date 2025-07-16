import fs from "fs-extra";
import { glob } from "glob";
import path from "path";
import chokidar from "chokidar";
import { fileURLToPath } from "url";

const TREE_HEADER = `--------------------------------------------------------------------------------------------------------------

Here is the current structure of your React components.

Point to be Noted : 
    📁  — Represents a Folder  
    📦  — Represents a Component File and all Components under this are imported Components (*This does not include Commented Component Imports)

🔍 Search Instructions:
    • To search for an Individual components (e.g., \`ExampleComponent.js\`), include \`📦 \` in the beginning :  
      📦 App.js  
    • To search for a specific Imported Components (e.g., \`LandingPage.jsx\`), include \`─ \` in the beginning :  
      ─ LandingPage.jsx

This structure allows you to visually trace:
    - Where a Component lives
    - Which Components are imported inside others
    - Line numbers where Imports occur (shown using \`← line X\`)

--------------------------------------------------------------------------------------------------------------






`;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(process.cwd(), "src");
const OUTPUT_DIR = path.join(SRC_DIR, "graphify");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "componentsTree.txt");

// Strip all JS comments
function stripComments(code) {
  return code.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

// Extract import paths and their line numbers
function parseImportsWithLines(code) {
  const lines = code.split("\n");
  const results = [];
  const importRegex = /import\s+(?:[\s\S]*?)\s+from\s+['"](.*?)['"]/;

  lines.forEach((line, index) => {
    const match = importRegex.exec(line);
    if (match && !line.trim().startsWith("//")) {
      results.push({ path: match[1], line: index + 1 });
    }
  });

  return results;
}

function normalizePath(p) {
  return p.replace(/\.(js|jsx|ts|tsx)$/, "").replace(/\\/g, "/");
}

function isComponentFile(filePath) {
  const base = path.basename(filePath).replace(/\.(js|jsx|ts|tsx)$/, "");
  return /^[A-Z]/.test(base);
}

function resolveComponentFile(basePath) {
  const exts = [".js", ".jsx", ".ts", ".tsx"];
  for (const ext of exts) {
    const fullPath = basePath + ext;
    if (fs.existsSync(fullPath)) return path.resolve(fullPath);
  }
  return null;
}

// Build a nested folder tree with components and their imports
async function buildComponentTree() {
  const files = await glob(`${SRC_DIR}/**/*.{js,jsx,ts,tsx}`, {
    ignore: ["**/node_modules/**"],
  });

  const componentFileSet = new Set();
  const fileMap = {};

  for (const file of files) {
    if (isComponentFile(file)) {
      componentFileSet.add(path.resolve(file));
    }
  }

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const cleaned = stripComments(content);
    const imports = parseImportsWithLines(cleaned);

    const importComponents = imports
      .filter((imp) => imp.path.startsWith("."))
      .map((imp) => {
        const importBase = path.resolve(path.dirname(file), imp.path);
        const fullImportPath = resolveComponentFile(importBase);
        if (fullImportPath && componentFileSet.has(fullImportPath)) {
          return {
            name: normalizePath(path.basename(fullImportPath)),
            line: imp.line,
          };
        }
        return null;
      })
      .filter(Boolean);

    const relPath = path.relative(SRC_DIR, file).replace(/\\/g, "/");
    const parts = relPath.split("/");
    let current = fileMap;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        // It's a file
        if (isComponentFile(part)) {
          current[part] = importComponents;
        }
      } else {
        current[part] = current[part] || {};
        current = current[part];
      }
    }
  }

  return fileMap;
}

// Render the folder tree to string
function renderTree(tree, prefix = "", isLast = true) {
  const lines = [];

  const entries = Object.entries(tree).filter(
    ([_, val]) =>
      typeof val === "object" && (Array.isArray(val) || Object.keys(val).length)
  );

  entries.forEach(([key, val], index) => {
    const isLastEntry = index === entries.length - 1;
    const branch = isLastEntry ? "└──" : "├──";
    const nextPrefix = prefix + (isLastEntry ? "    " : "│   ");

    if (Array.isArray(val)) {
      // Calculate max imported component name length (excluding .jsx) in this component
      const maxLength = val.reduce((max, imp) => {
        const nameLength = `${imp.name}.jsx`.length;
        return nameLength > max ? nameLength : max;
      }, 0);
      const padLength = maxLength + 5;

      // Component file and its imports
      lines.push(`${prefix}${branch} 📦 ${key}`);
      val.forEach((imp, i) => {
        const isLastImp = i === val.length - 1;
        const impBranch = isLastImp ? "└──" : "├──";
        const paddedName = `${imp.name}.jsx`.padEnd(padLength, " ");
        lines.push(`${nextPrefix}${impBranch} ${paddedName}← line ${imp.line}`);
      });
      lines.push(`${nextPrefix}`); // Blank line for spacing
    } else {
      // Folder
      lines.push(`${prefix}${branch} 📁 ${key}`);
      lines.push(`${nextPrefix}|`);

      // Pre-compute max import name length for all components in this folder
      const folderComponentEntries = Object.entries(val).filter(([_, v]) =>
        Array.isArray(v)
      );
      const maxImportLength = folderComponentEntries.reduce(
        (max, [_, imports]) => {
          imports.forEach((imp) => {
            const len = `${imp.name}.jsx`.length;
            if (len > max) max = len;
          });
          return max;
        },
        0
      );

      const updatedSubtree = Object.fromEntries(
        Object.entries(val).map(([k, v]) => {
          if (Array.isArray(v)) {
            const paddedImports = v.map((imp) => ({
              ...imp,
              paddedName: `${imp.name}.jsx`.padEnd(maxImportLength + 5, " "),
            }));
            return [k, paddedImports];
          }
          return [k, v];
        })
      );

      const subTree = renderTree(updatedSubtree, nextPrefix, isLastEntry);
      lines.push(...subTree);
    }
  });

  return lines;
}

async function writeToFile() {
  const tree = await buildComponentTree();
  const outputLines = renderTree({ src: tree });
  const fullOutput = TREE_HEADER + "\n" + outputLines.join("\n");
  fs.ensureDirSync(OUTPUT_DIR);
  fs.writeFileSync(OUTPUT_FILE, fullOutput, "utf-8");
  // console.log(
  //   "Component_Import_Tree updated : Time" +
  //     ` - ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
  // );
}

export async function startWatching() {
  console.log("Graphify is active ...");
  const watcher = chokidar.watch(`${SRC_DIR}/**/*.{js,jsx,ts,tsx}`, {
    ignoreInitial: false,
    ignored: /node_modules/,
  });

  const update = async () => {
    await writeToFile();
  };

  watcher.on("add", update).on("change", update).on("unlink", update);
}
