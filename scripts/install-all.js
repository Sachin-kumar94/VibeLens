import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

console.log("\x1b[36m%s\x1b[0m", "▲ Installing backend dependencies...");
execSync("npm install", { cwd: path.join(rootDir, "backend"), stdio: "inherit" });

console.log("\x1b[36m%s\x1b[0m", "▲ Installing frontend dependencies...");
execSync("npm install", { cwd: path.join(rootDir, "frontend"), stdio: "inherit" });

console.log("\x1b[32m%s\x1b[0m", "✓ All VibeLens dependencies installed successfully.");
