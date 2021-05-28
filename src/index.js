import fs from "fs";
import glob from "glob";
import path from "path";
import { promisify } from "util";
import prettier from "prettier";

import Gherkin from "@cucumber/gherkin";
import Messages from "@cucumber/messages";

async function parseFeatureFile(path) {
	const readFile = promisify(fs.readFile);

	const uuidFn = Messages.IdGenerator.uuid();
	const builder = new Gherkin.AstBuilder(uuidFn);
	const matcher = new Gherkin.GherkinClassicTokenMatcher(); // or Gherkin.GherkinInMarkdownTokenMatcher()

	const parser = new Gherkin.Parser(builder, matcher);
	const gherkinDocument = parser.parse(await readFile(path, "utf8"));

	return Gherkin.compile(
		gherkinDocument,
		gherkinDocument.feature.name,
		uuidFn,
	);
}

function matchDriverToStep(driverModules, step) {
	for (const driverModule of driverModules) {
		const modulePath = driverModule.filePath;

		for (const [exportName, { matcher }] of Object.entries(
			driverModule.module,
		)) {
			if (matcher.test(step.text)) {
				return { exportName, modulePath };
			}
		}
	}
}

function generateAvaTestFromPickle(driverModules, outputFilename, pickle) {
	const testDescription = [
		`${pickle.name}:`,
		...pickle.steps.map((step) => step.text),
	].join("\n");

	const testSteps = [];
	const requiredImports = {};
	for (const step of pickle.steps) {
		const testAdditions = matchDriverToStep(driverModules, step);
		if (!testAdditions) {
			testSteps.push(
				`t.fail("No driver found for step '${step.text}'");`,
			);
			continue;
		}

		const relativeModulePath = path.relative(
			path.dirname(outputFilename),
			testAdditions.modulePath,
		);

		requiredImports[relativeModulePath] = [
			...(requiredImports[relativeModulePath] || []),
			testAdditions.exportName,
		];

		testSteps.push(`await ${testAdditions.exportName}(t)`);
	}

	const stringifiedTest = `
	${pickle.tags.map((tag) => `//${tag.name.replace("@", " ")}`).join("\n")}
	test(\`${testDescription}\`, async t =>{
${testSteps.join("\n")}
	});
`;

	return { requiredImports, stringifiedTest };
}

async function generateAvaTestFileFromFeatureFilePath(
	driverModules,
	testFolder,
	featureFilePath,
) {
	const outputFilename = path.join(
		testFolder,
		`${path.parse(featureFilePath).name}.test.js`,
	);

	const writeFile = promisify(fs.writeFile);
	const prettierConfig = await prettier.resolveConfig(testFolder);
	const pickles = await parseFeatureFile(featureFilePath);

	const testSpecs = pickles.map(
		generateAvaTestFromPickle.bind(null, driverModules, outputFilename),
	);

	const importBlock = {};
	for (const { requiredImports } of testSpecs) {
		for (const [modulePath, importedFns] of Object.entries(
			requiredImports,
		)) {
			importBlock[modulePath] = [
				...(importBlock[modulePath] || []),
				...importedFns,
			];
		}
	}

	const testBodys = [];

	for (const { stringifiedTest } of testSpecs) {
		testBodys.push(stringifiedTest);
	}

	const fullTestFile = prettier.format(
		`
		import test from "ava";
		${Object.entries(importBlock).map(
			([modulePath, importedFns]) =>
				`import { ${importedFns.join(", ")} } from "${modulePath}"`,
		)}

	${testBodys.join("\n\n")}
	`,
		{ ...prettierConfig, parser: "babel" },
	);

	await writeFile(outputFilename, fullTestFile, "utf8");
}

(async function main() {
	const [featureFileGlob, driverFileGlob, testFolder] = process.argv.slice(2);

	const driverFilePaths = await promisify(glob)(driverFileGlob, {
		absolute: true,
	});
	const allDriverModules = await Promise.all(
		driverFilePaths.map((filePath) =>
			import(filePath).then((module) => ({
				module,
				filePath,
			})),
		),
	);

	const featureFilePaths = await promisify(glob)(featureFileGlob, {
		absolute: true,
	});

	await Promise.all(
		featureFilePaths.map(
			generateAvaTestFileFromFeatureFilePath.bind(
				null,
				allDriverModules,
				path.resolve(testFolder),
			),
		),
	);
})();
