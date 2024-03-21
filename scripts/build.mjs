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
		entryPoints: ["src/server/**/*.ts"],
		outDir: "dist/server",
		format: "cjs",
		target: "node16",
		clean: true,
		minify: config.minify,
		watch: args.includes("--watch"),
		onSuccess: () => {
			spinner.succeed("Built server");
			args.includes("--watch") && firstRun && finishBuild();
			firstRun = true;
		},
	});
	spinner.succeed("Built server");
}

async function clientBuild() {
	const spinner = ora("Building client").start();
	await build({
		entryPoints: ["src/client/**/*.ts"],
		outDir: "dist/client",
		format: "cjs",
		target: "chrome93",
		clean: true,
		minify: config.minify,
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
	const root = path.resolve(__dirname, "..");
	const output = path.resolve(root, config.output);
	const copySpinner = ora("Copying files").start();
	for (const file of config.copy) {
		const from = file.from.replace("{OUT}", root);
		const to = file.to.replace("{OUT}", output);
		const spinner = ora(`Copying ${from} to ${to}`).start();
		await new Promise((resolve, reject) => {
			copy(from, to, (err) => {
				if (err) {
					spinner.fail(`Failed to copy ${from} to ${to}`);
					reject(err);
				} else {
					spinner.succeed(`Copied ${from} to ${to}`);
					resolve();
				}
			});
		});
	}
	copySpinner.succeed("Copied files");

	if (config.obfuscate) {
		const obfuscateSpinner = ora("Obfuscating files").start();
		const files = await fs.promises.readdir(output, {
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
			`Obfuscated ${obfuscatedFiles.length} files: ${obfuscatedFiles.join(
				", ",
			)}`,
		);
	} else {
		console.log(
			`${chalk.blueBright("Info:")} skipping obfuscation. To enable obfuscation, set ${chalk.bold("obfuscate")} to ${chalk.bold("true")} in ${chalk.bold("build-config.json5")}`,
		);
	}
}

main();
