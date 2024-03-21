import fs from "fs";
import path from "path";
import quicktype from "quicktype-core";
import ora from "ora";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function generateConfigTypes() {
	const spinner = ora("Generating config types").start();

	const jsonString = fs.readFileSync(
		path.resolve(__dirname, "../config.json"),
		"utf-8",
	);
	const jsonInput = quicktype.jsonInputForTargetLanguage("typescript");
	await jsonInput.addSource({
		name: "config",
		samples: [jsonString],
	});
	const inputData = new quicktype.InputData();
	inputData.addInput(jsonInput);
	const result = await quicktype.quicktype({
		inputData,
		lang: "typescript",
		rendererOptions: {
			"just-types": true,
		},
	});
	const types = result.lines.join("\n");
	fs.writeFileSync(path.resolve(__dirname, "../src/config.d.ts"), types);

	spinner.succeed("Generated config types");
}

generateConfigTypes();
