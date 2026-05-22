import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function readReferenceTemplate() {
  try {
    return await readFile(join(process.cwd(), "docs", "xml-plantilla.xml"), "utf8");
  } catch {
    return undefined;
  }
}
