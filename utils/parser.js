import fs from "fs-extra";

export async function getExportType(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  if (/export\s+default/.test(content)) return "default";
  if (/export\s+{/.test(content)) return "named";
  return "unknown";
}

export async function parseComponentProps(filePath) {
  const content = await fs.readFile(filePath, "utf-8");

  // Destructured props: function MyComp({ title, onClick }) {...}
  const destructured = [...content.matchAll(/\{\s*([\w,\s]+)\s*\}/g)]
    .flatMap((m) => m[1].split(",").map((s) => s.trim()))
    .filter(Boolean);

  // props.usage: props.title, props.onClick
  const dotted = [...content.matchAll(/props\.(\w+)/g)].map((m) => m[1]);

  return [...new Set([...destructured, ...dotted])];
}
