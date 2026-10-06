import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

console.log("\x1b[36m%s\x1b[0m", "▲ VibeLens Dev Runner: Starting Server & Client...");

const serverProcess = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(rootDir, "backend"),
  stdio: ["ignore", "inherit", "inherit"],
  shell: isWindows,
});

const clientProcess = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(rootDir, "frontend"),
  stdio: ["ignore", "inherit", "inherit"],
  shell: isWindows,
});

function cleanup() {
  console.log("\n\x1b[33m%s\x1b[0m", "Shutting down VibeLens dev processes...");
  if (isWindows) {
    try {
      if (serverProcess.pid) spawn("taskkill", ["/pid", String(serverProcess.pid), "/T", "/F"], { stdio: "ignore" });
    } catch (e) {}
    try {
      if (clientProcess.pid) spawn("taskkill", ["/pid", String(clientProcess.pid), "/T", "/F"], { stdio: "ignore" });
    } catch (e) {}
  } else {
    try {
      serverProcess.kill();
    } catch (e) {}
    try {
      clientProcess.kill();
    } catch (e) {}
  }
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
