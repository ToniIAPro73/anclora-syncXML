import { readdir } from "node:fs/promises";
import path from "node:path";

const docsDir = path.resolve("docs");
const blockedExtensions = new Set([".xlsx", ".xls", ".csv", ".ods"]);
const allowedRoots = new Set([
  path.resolve("test-data/fixtures"),
]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

function isAllowedPath(filePath) {
  return [...allowedRoots].some((root) => filePath.startsWith(root + path.sep) || filePath === root);
}

async function main() {
  const files = await walk(docsDir);
  const blocked = files
    .filter((filePath) => blockedExtensions.has(path.extname(filePath).toLowerCase()))
    .filter((filePath) => !isAllowedPath(filePath))
    .map((filePath) => path.relative(process.cwd(), filePath))
    .sort();

  if (blocked.length === 0) {
    console.log("Public docs policy check passed.");
    return;
  }

  console.error("Blocked spreadsheet-like files found under docs/:");
  for (const filePath of blocked) console.error(`- ${filePath}`);
  console.error("Move synthetic fixtures to test-data/fixtures/ and keep docs/ free of spreadsheet uploads.");
  process.exitCode = 1;
}

main().catch((error) => {
  console.error("Failed to validate public docs policy.");
  console.error(error);
  process.exitCode = 1;
});
