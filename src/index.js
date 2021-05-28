const fs = require("fs");
const glob = require("glob");
const path = require("path");
const { promisify } = require("util");
const prettier = require("prettier");

const Gherkin = require("@cucumber/gherkin");
const Messages = require("@cucumber/messages");

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

function generateAvaTestFromPickle(pickle) {
	const testDescription = [
		`${pickle.name}:`,
		...pickle.steps.map((step) => step.text),
	].join("\n");

	const stringifiedTest = `
	${pickle.tags.map((tag) => `//${tag.name.replace("@", " ")}`).join("\n")}
	test(\`${testDescription}\`, t =>{
t.pass();
	});
`;

	return { stringifiedTest };
}

async function generateAvaTestFileFromFeatureFilePath(
	driverFileGlob,
	testFolder,
	featureFilePath,
) {
	const writeFile = promisify(fs.writeFile);
	const prettierConfig = await prettier.resolveConfig(testFolder);
	const pickles = await parseFeatureFile(featureFilePath);

	const testSpecs = pickles.map(generateAvaTestFromPickle);

	const testBodys = [];

	for (const { stringifiedTest } of testSpecs) {
		testBodys.push(stringifiedTest);
	}

	const fullTestFile = prettier.format(
		`
		const test = require( "ava");

	${testBodys.join("\n\n")}
	`,
		{ ...prettierConfig, parser: "babel" },
	);

	const outputFilename = path.join(
		testFolder,
		`${path.parse(featureFilePath).name}.test.js`,
	);

	await writeFile(outputFilename, fullTestFile, "utf8");
	console.log(outputFilename);
}

(async function main() {
	const [featureFileGlob, driverFileGlob, testFolder] = process.argv.slice(2);

	const featureFilePaths = await promisify(glob, { absolute: true })(
		featureFileGlob,
	).then((filePaths) => filePaths.map((filePath) => path.resolve(filePath)));

	await Promise.all(
		featureFilePaths.map(
			generateAvaTestFileFromFeatureFilePath.bind(
				null,
				driverFileGlob,
				path.resolve(testFolder),
			),
		),
	);
})();
