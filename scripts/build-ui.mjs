import { fileURLToPath } from "url";
import path from "path";
import { spawn } from "child_process";
import chalk from "chalk";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);

const mode =
	args.find((arg) => arg.startsWith("--mode="))?.split("=")[1] || "prod";

function buildUI() {
	if (!fs.existsSync(path.resolve(__dirname, "../.ui"))) {
		console.log(
			`${chalk.blueBright("Info:")} UI directory not found — skipping`,
		);

		return process.stdin.resume();
	}

	const child = spawn("pnpm", ["run", mode === "dev" ? "dev" : "build"], {
		cwd: path.resolve(__dirname, "../.ui"),
		stdio: "inherit",
	});

	child.on("exit", (code) => {
		process.exit(code);
	});
}

buildUI();
