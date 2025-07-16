import fs from "fs-extra";

export async function getFileSizeAndLines(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n").length;
  const stats = await fs.stat(filePath);
  return {
    lines,
    sizeKB: stats.size / 1024,
  };
}
