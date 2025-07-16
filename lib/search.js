import fs from "fs-extra";
import path from "path";
import { buildComponentTree } from "./analyzer.js";
import { parseComponentProps, getExportType } from "../utils/parser.js";
import { getFileSizeAndLines } from "../utils/fsUtils.js";
import { glob } from "glob";

const SRC_DIR = path.join(process.cwd(), "src");

// ----------------- Common Funtion to get Report Mode Details
function getModeDetail(name, mode) {
  console.log(`
        
        
────────────────────────────────────────────────────────────────
                React Component Graphify Report
────────────────────────────────────────────────────────────────

Component Analyzed           : ${name}  
Analysis Mode                : ${mode.charAt(0).toUpperCase()}  ←  (${
    mode.toLowerCase() === "all" || mode.toLowerCase() === "a"
      ? "Full Overview"
      : mode.toLowerCase() == "imp" || mode.toLowerCase() === "i"
      ? "Import Usage"
      : mode.toLowerCase() == "dead" || mode.toLowerCase() === "d"
      ? "Dead Component Check"
      : mode.toLowerCase() == "size" || mode.toLowerCase() === "s"
      ? "Size & LOC"
      : mode.toLowerCase() == "exp" || mode.toLowerCase() === "e"
      ? "Export Type"
      : mode.toLowerCase() == "props" || mode.toLowerCase() === "p"
      ? "Props Used"
      : mode.toLowerCase() == "file" || mode.toLowerCase() === "f"
      ? "File Information"
      : "Unknown"
  })
`);
}

// --------------- Formatter Function for Name
async function formatName(name) {
  const filePath = await findFileRecursively(SRC_DIR, name.split(".")[0]);
  const extension = path.extname(filePath);
  console.log(extension);
  return name.split(".")[0];
}

// ----------------- Function to get Some data
async function getComponentInfoAndFormat(name) {
  const filePath = await findFileRecursively(SRC_DIR, name.split(".")[0]);
  if (!filePath) {
    return {
      formattedName: name.split(".")[0],
      componentValidation: true,
    };
  } else {
    const extension = path.extname(filePath);

    let isExtensionIncluded = false;

    if (name.split(".").length == 1) {
      isExtensionIncluded = false;
    } else if (name.split(".").length > 1) {
      isExtensionIncluded = true;
    }

    let componentValidation = false;
    if (isExtensionIncluded) {
      if ("." + name.split(".")[1].toLowerCase() == extension) {
        componentValidation = true;
      } else {
        componentValidation = false;
      }
    } else {
      componentValidation = true;
    }

    return {
      formattedName: name.split(".")[0],
      componentValidation: componentValidation,
    };
  }
}

export async function searchComponent(name, mode) {
  let tempData = await getComponentInfoAndFormat(name);
  switch (mode.toLowerCase()) {
    case "a":
    case "all": // shows all info about the component
      getModeDetail(tempData?.formattedName, mode);
      if (tempData?.componentValidation) {
        await showAll(tempData?.formattedName);
      } else {
        console.log(
          `# Error! There is no Component with the given Extension. Please provide the Component Name with correct Extension or provide only the Component Name.
          `
        );
      }
      console.log(`────────────────────────────────────────────────────────────────


`);
      break;
    case "i":
    case "imp": // shows in how many files the component is imported
      getModeDetail(tempData?.formattedName, mode);
      if (tempData?.componentValidation) {
        await showImportUsage(tempData?.formattedName);
      } else {
        console.log(
          `# Error! There is no Component with the given Extension. Please provide the Component Name with correct Extension or provide only the Component Name.
          `
        );
      }
      console.log(`────────────────────────────────────────────────────────────────


`);
      break;
    case "d":
    case "dead": // checks if the component is dead (not imported anywhere)
      getModeDetail(tempData?.formattedName, mode);
      if (tempData?.componentValidation) {
        await showDeadStatus(tempData?.formattedName);
      } else {
        console.log(
          `# Error! There is no Component with the given Extension. Please provide the Component Name with correct Extension or provide only the Component Name.
          `
        );
      }
      console.log(`────────────────────────────────────────────────────────────────


`);
      break;
    case "s":
    case "size": // shows size and lines of the component file
      getModeDetail(tempData?.formattedName, mode);
      if (tempData?.componentValidation) {
        await showSizeAndLines(tempData?.formattedName);
      } else {
        console.log(
          `# Error! There is no Component with the given Extension. Please provide the Component Name with correct Extension or provide only the Component Name.
          `
        );
      }
      console.log(`────────────────────────────────────────────────────────────────


`);
      break;
    case "e":
    case "exp": // shows export type of the component
      getModeDetail(tempData?.formattedName, mode);
      if (tempData?.componentValidation) {
        await showExportTypeInfo(tempData?.formattedName);
      } else {
        console.log(
          `# Error! There is no Component with the given Extension. Please provide the Component Name with correct Extension or provide only the Component Name.
          `
        );
      }
      console.log(`────────────────────────────────────────────────────────────────


`);
      break;
    case "p":
    case "props": // shows props used in the component
      getModeDetail(tempData?.formattedName, mode);
      if (tempData?.componentValidation) {
        await showPropUsage(tempData?.formattedName);
      } else {
        console.log(
          `# Error! There is no Component with the given Extension. Please provide the Component Name with correct Extension or provide only the Component Name.
          `
        );
      }
      console.log(`────────────────────────────────────────────────────────────────


`);
      break;
    case "f":
    case "file": // shows props used in the component
      getModeDetail(tempData?.formattedName, mode);
      if (tempData?.componentValidation) {
        await showFileInfo(tempData?.formattedName);
      } else {
        console.log(
          `# Error! There is no Component with the given Extension. Please provide the Component Name with correct Extension or provide only the Component Name.
          `
        );
      }
      console.log(`────────────────────────────────────────────────────────────────


`);
      break;
    default:
      console.error(`


────────────────────────────────────────────────────────────────

# Error! Unknown mode provided!

# Please use one of the following valid modes:

    • a | all     → Full Overview
    • i | imp     → Import Usage
    • d | dead    → Dead Component Check
    • s | size    → Component Size & LOC
    • e | exp     → Export Type
    • p | props   → Props Used
    • f | file    → File Information

💡 Tip: run "graphify help" to see all usage examples.

────────────────────────────────────────────────────────────────


`);
  }
}

// ----------------- imports -> i
async function showImportUsage(name) {
  const all = await findFileRecursively(SRC_DIR, name);

  if (!all) {
    return console.log(`# Error! Invalid component name
        `);
  } else {
    const tree = await buildComponentTree();
    const matches = [];

    function traverse(obj, currentPath = "") {
      for (const key in obj) {
        const value = obj[key];
        const newPath = currentPath ? `${currentPath}/${key}` : key;

        if (Array.isArray(value)) {
          value.forEach((imp) => {
            if (imp.name === name) {
              matches.push({ file: newPath, line: imp.line });
            }
          });
        } else if (typeof value === "object") {
          traverse(value, newPath);
        }
      }
    }

    traverse(tree);

    console.log(`# Import Usage`);

    if (matches.length === 0) {
      console.log(`    + Total imports found    : 0`);
    } else {
      console.log(`    + Total imports found    : ${matches.length}`);

      // calculate max length
      const maxLength = Math.max(...matches.map((m) => m.file.length)) + 6;

      matches.forEach((match) => {
        const paddedFile = match.file.padEnd(maxLength, " ");
        console.log(`    • ${paddedFile}← line ${match.line}`);
      });
    }
    console.log("");
  }
}

// ----------------- dead -> d
async function showDeadStatus(name) {
  const all = await findFileRecursively(SRC_DIR, name);

  if (!all) {
    return console.log(`# Error! Invalid component name
     `);
  } else {
    const tree = await buildComponentTree();
    let imported = false;

    function traverse(obj) {
      for (const val of Object.values(obj)) {
        if (Array.isArray(val)) {
          if (val.find((imp) => imp.name === name)) {
            imported = true;
            return;
          }
        } else if (typeof val === "object") {
          traverse(val);
        }
      }
    }

    traverse(tree);

    console.log(`# Dead Component Check`);

    if (imported) {
      console.log(`    • Status                 : Active (used in project)
        `);
    } else {
      console.log(`    • Status                 : Inactive (not used in project)
        `);
    }
  }
}

// ----------------- size and lines -> s
async function showSizeAndLines(name) {
  const all = await findFileRecursively(SRC_DIR, name);

  if (!all) {
    return console.log(`# Error! Invalid component name
     `);
  } else {
    const all = await findFileRecursively(SRC_DIR, name);

    console.log(`# Size & LOC`);

    if (!all) {
      console.log(`    • Error! Invalid component name`);
      return;
    }

    const content = await fs.readFile(all, "utf-8");

    const { sizeKB, lines } = await getFileSizeAndLines(all);
    const commentLines = countCommentLines(content);

    console.log(`    • Lines of code          : ${lines}`);
    console.log(
      `    • Commented lines        : ${commentLines} ---- [${(
        (commentLines / lines) *
        100
      ).toFixed(2)}%]`
    );
    const displaySize = formatFileSize(sizeKB);
    console.log(`    • File size              : ${displaySize}
        `);
  }
}

function formatFileSize(kb) {
  const bytes = kb * 1024;

  if (bytes < 1024) {
    return `${bytes.toFixed(0)} B`;
  } else if (bytes < 1024 * 1024) {
    return `${kb.toFixed(2)} KB`;
  } else {
    return `${(kb / 1024).toFixed(2)} MB`;
  }
}

function countCommentLines(content) {
  const lines = content.split("\n");

  let commentCount = 0;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (inBlockComment) {
      commentCount++;
      if (trimmed.endsWith("*/")) {
        inBlockComment = false;
      }
    } else if (trimmed.startsWith("//")) {
      commentCount++;
    } else if (trimmed.startsWith("/*")) {
      commentCount++;
      if (!trimmed.endsWith("*/")) {
        inBlockComment = true;
      }
    }
  }

  return commentCount;
}

async function findFileRecursively(dir, name) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const result = await findFileRecursively(fullPath, name);
      if (result) return result;
    } else if (entry.isFile() && entry.name.startsWith(name)) {
      return fullPath;
    }
  }
  return null;
}

// ----------------- show all
async function showAll(name) {
  const all = await findFileRecursively(SRC_DIR, name);

  if (!all) {
    return console.log(`# Error! Invalid component name
        `);
  } else {
    await showFileInfo(name);
    await showImportUsage(name);
    await showDeadStatus(name);
    await showSizeAndLines(name);
    await showExportTypeInfo(name);
    await showPropUsage(name);
  }
}

// ----------------- export type -> e
async function showExportTypeInfo(name) {
  const filePath = await findComponentFile(name);
  if (!filePath) {
    console.log(`# Error! Invalid component name
        `);
    return;
  }

  console.log(`# Export Type`);

  const content = await fs.readFile(filePath, "utf-8");

  if (/export\s+default/.test(content)) {
    console.log(`    • Type                   : Default Export
        `);
  } else if (/export\s+{/.test(content)) {
    console.log(`    • Type                   : Named Export
        `);
  } else {
    console.log(`    • Type                   : Unknown Export
        `);
  }
}

async function findComponentFile(name) {
  const exts = [".js", ".jsx", ".ts", ".tsx"];
  const SRC_DIR = path.join(process.cwd(), "src");

  for (const ext of exts) {
    const filePath = path.join(SRC_DIR, "**", `${name}${ext}`);
    const matches = await glob(filePath.replace(/\\/g, "/"));
    if (matches.length > 0) return matches[0];
  }

  return null;
}

// ----------------- props -> p
async function showPropUsage(name) {
  const filePath = await findComponentFile(name);
  if (!filePath) {
    console.log(`# Error! Invalid component name
        `);
    return;
  }

  const content = await fs.readFile(filePath, "utf-8");

  const propSet = new Set();

  // Detect props usage like props.title or props.onClick
  const propDotAccessRegex = /props\.([a-zA-Z0-9_]+)/g;
  let match;
  while ((match = propDotAccessRegex.exec(content)) !== null) {
    propSet.add(match[1]);
  }

  // Detect destructured props like function MyComponent({ title, onClick }) { ... }
  const destructuredRegex =
    /function\s+[A-Z][A-Za-z0-9]*\s*\(\s*{([^}]*)}\s*\)/g;
  while ((match = destructuredRegex.exec(content)) !== null) {
    const propsList = match[1]
      .split(",")
      .map((p) => p.trim().split("=")[0].trim())
      .filter(Boolean);
    propsList.forEach((prop) => propSet.add(prop));
  }

  // Arrow functions: const MyComponent = ({ title, value }) => { ... }
  const arrowFunctionRegex =
    /const\s+[A-Z][A-Za-z0-9]*\s*=\s*\(\s*{([^}]*)}\s*\)\s*=>/g;
  while ((match = arrowFunctionRegex.exec(content)) !== null) {
    const propsList = match[1]
      .split(",")
      .map((p) => p.trim().split("=")[0].trim())
      .filter(Boolean);
    propsList.forEach((prop) => propSet.add(prop));
  }
  console.log(`# Props Used`);
  if (propSet.size === 0) {
    console.log(`    + No props detected `);
  } else {
    Array.from(propSet).forEach((prop) => {
      console.log(`    • ${prop}`);
    });
  }
  console.log(``);
}

// ----------------- File Info
async function showFileInfo(name) {
  const filePath = await findFileRecursively(SRC_DIR, name);

  if (!filePath) {
    console.log(`# Error! Invalid component name
       `);
    return;
  }
  console.log(`# File Information`);

  const extension = path.extname(filePath); // e.g., .js, .jsx
  const relativePath = path.relative(SRC_DIR, filePath).replace(/\\/g, "/"); // full path from /src

  console.log(`    • File Type              : ${extension}`);
  console.log(`    • File Directory         : ${relativePath}
    `);
}

// ----------------- File Extension
// async function showFileInfo(name) {
//   const filePath = await findFileRecursively(SRC_DIR, name);

//   console.log(`# File Information`);

//   if (!filePath) {
//     console.log(`    • Error! Invalid component name

//         `);
//     return;
//   }

//   const extension = path.extname(filePath); // e.g., .js, .jsx
//   const relativePath = path.relative(SRC_DIR, filePath).replace(/\\/g, "/"); // full path from /src

//   console.log(`    • File Type              : ${extension}`);
//   console.log(`    • File Directory         : ${relativePath}
//     `);
// }
