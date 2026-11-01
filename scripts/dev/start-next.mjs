import { cpSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawn } from "node:child_process";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const [app, port] = process.argv.slice(2);
if (!["marketing", "citizen", "office"].includes(app) || !/^300[0-2]$/.test(port)) {
  console.error("Choose marketing3000, citizen3001 or office3002.");
  process.exit(2);
}
const directory = path.join(root, "apps", app),
  standalone = path.join(directory, ".next/standalone/apps", app);
if (!existsSync(path.join(standalone, "server.js"))) {
  console.error(`Build the app first: pnpm --filter @openobec/${app} build`);
  process.exit(1);
}
cpSync(path.join(directory, ".next/static"), path.join(standalone, ".next/static"), {
  recursive: true,
});
cpSync(path.join(directory, "public"), path.join(standalone, "public"), { recursive: true });
const child = spawn(process.execPath, [path.join(standalone, "server.js")], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    HOSTNAME: process.env.HOSTNAME ?? "127.0.0.1",
    PORT: process.env.PORT ?? port,
  },
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
child.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
