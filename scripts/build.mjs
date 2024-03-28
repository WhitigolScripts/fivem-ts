import { build } from "tsup";
import ora from "ora";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import chalk from "chalk";
import { fileURLToPath } from "url";
import copy from "copy";
import JSON5 from "json5";
import obfuscator from "javascript-obfuscator";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawConfig = fs.readFileSync(
	path.resolve(__dirname, "../build-config.json5"),
	"utf-8",
);
const config = JSON5.parse(rawConfig);

const args = process.argv.slice(2);

async function serverBuild() {
	let firstRun = false;
	const spinner = ora("Building server").start();
	await build({
		entryPoints: ["src/server/index.ts"],
		bundle: true,
		outDir: "dist/server",
		format: "cjs",
		target: "node16",
		clean: true,
		minify: config.minify,
		watch: args.includes("--watch"),
		onSuccess: () => {
			spinner.succeed("Built server");
			if (!args.includes("--watch")) return finishBuild();
			if (firstRun && args.includes("--watch")) {
				finishBuild();
			}
			firstRun = true;
		},
	});
	spinner.succeed("Built server");
}

async function clientBuild() {
	const spinner = ora("Building client").start();
	await build({
		entry: ["src/client/index.ts"],
		outDir: "dist/client",
		target: "chrome93",
		clean: true,
		minify: config.minify,
		bundle: true,
		esbuildOptions: (options) => {
			options.format = "iife";
			options.bundle = true;
		},
		watch: args.includes("--watch"),
		onSuccess: () => {
			spinner.succeed("Built client");
			finishBuild();
		},
	});
	spinner.succeed("Built client");
}

async function main() {
	try {
		await new Promise((resolve, reject) => {
			if (
				config.output === "./output" &&
				process.env.NODE_ENV !== "development"
			) {
				console.error(
					`${chalk.red("Error:")} Please change the output directory in ${chalk.bold("build-config.json5")}`,
				);
				return reject();
			}
			resolve();
		});

		serverBuild();
		clientBuild();
	} catch (_) {
		ora()
			.start()
			.fail(
				"Failed to build project. Please check the error message above.",
			);
	}
}

async function finishBuild() {
	const spinner = ora(`Copying files`).start();
	const root = path.resolve(__dirname, "..");
	const output = path.resolve(root, config.output);
	for (const file of config.copy) {
		spinner.text = `Copying ${file.from} to ${file.to}`;
		const from = file.from.replace("{OUT}", root);
		const to = file.to.replace("{OUT}", output);
		await new Promise((resolve, reject) => {
			copy(from, to, (err) => {
				if (err) {
					spinner.fail(`Failed to copy ${from} to ${to}`);
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
	spinner.succeed("Copied files");

	if (config.obfuscate) {
		const obfuscateSpinner = ora("Obfuscating files").start();
		const files = await fs.promises.readdir(path.join(output, "dist"), {
			withFileTypes: true,
			recursive: true,
		});
		let obfuscatedFiles = [];
		for (const file of files) {
			if (file.isFile() && file.name.endsWith(".js")) {
				const code = await fs.promises.readFile(
					path.resolve(output, file.path, file.name),
					"utf-8",
				);
				const obfuscated = obfuscator.obfuscate(code, {
					compact: true,
					controlFlowFlattening: true,
					controlFlowFlatteningThreshold: 1,
					deadCodeInjection: true,
					deadCodeInjectionThreshold: 1,
					debugProtection: false,
					disableConsoleOutput: false,
				});
				await fs.promises.writeFile(
					path.resolve(output, file.path, file.name),
					obfuscated.getObfuscatedCode(),
					"utf-8",
				);
				obfuscatedFiles.push(file.name);
			}
		}
		obfuscateSpinner.succeed(
			`Obfuscated ${obfuscatedFiles.length} files: ${obfuscatedFiles.join(", ")}`,
		);
	} else {
		console.log(
			`${chalk.blueBright("Info:")} skipping obfuscation. To enable obfuscation, set ${chalk.bold("obfuscate")} to ${chalk.bold("true")} in ${chalk.bold("build-config.json5")}`,
		);
	}
}

main();
