import { existsSync } from "node:fs";
import { dirname, join, parse } from "node:path";

export function findUp(targetPath: string, startDir: string): string | null {
  let currentDir = startDir;
  const { root } = parse(currentDir);

  while (true) {
    const candidate = join(currentDir, targetPath);

    if (existsSync(candidate)) {
      return candidate;
    }

    if (currentDir === root) {
      return null;
    }

    currentDir = dirname(currentDir);
  }
}
