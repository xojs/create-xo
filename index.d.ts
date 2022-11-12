
export default async function createXo(options?: {
	cwd?: string;
	isVueProject?: boolean;
	isReactProject?: boolean;
	createConfigFile?: boolean;
	skipInstall?: boolean;
	args?: string[];
}): Promise<void>;

// {
// 	const {
// 		packageJson = {},
// 		path: packagePath = path.resolve(options.cwd || '', 'package.json'),
// 	} = readPackageUpSync({
// 		cwd: options.cwd,
// 		normalize: false,
// 	}) || {};
