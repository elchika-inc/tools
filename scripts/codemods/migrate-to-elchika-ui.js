import {
  copyFileSync,
  existsSync,
  globSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Node, Project, QuoteKind, ScriptKind, SyntaxKind } from "ts-morph";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "../..");
const APPS_DIR = path.join(ROOT_DIR, "apps");
const REFERENCE_APP = path.join(APPS_DIR, "url-encoder");
const EXCLUDED_APPS = new Set(["url-encoder"]);
const FONT_LINK = '    <link rel="stylesheet" href="/fonts/fonts.css" />';
const FONT_LINK_TARGET = "../../../packages/router/public/fonts";

function isUseToastImport(importDeclaration) {
  return importDeclaration.getModuleSpecifierValue().endsWith("/useToast");
}

function removeLegacyToastImports(sourceFile) {
  for (const importDeclaration of sourceFile.getImportDeclarations().filter(isUseToastImport)) {
    const defaultImport = importDeclaration.getDefaultImport();
    const namespaceImport = importDeclaration.getNamespaceImport();
    for (const namedImport of importDeclaration.getNamedImports()) {
      if (["toast", "useToast"].includes(namedImport.getName())) {
        namedImport.remove();
      }
    }
    if (!defaultImport && !namespaceImport && importDeclaration.getNamedImports().length === 0) {
      importDeclaration.remove();
    }
  }
}

function removeUseToastDeclarations(sourceFile) {
  for (const statement of sourceFile.getDescendantsOfKind(SyntaxKind.VariableStatement)) {
    for (const declaration of statement.getDeclarations()) {
      const initializer = declaration.getInitializer();
      if (
        Node.isObjectBindingPattern(declaration.getNameNode()) &&
        declaration
          .getNameNode()
          .getElements()
          .some((element) => element.getName() === "toast") &&
        Node.isCallExpression(initializer) &&
        initializer.getExpression().getText() === "useToast"
      ) {
        if (statement.getDeclarations().length === 1) {
          statement.remove();
        } else {
          declaration.remove();
        }
        break;
      }
    }
  }
}

function transformToastCall(callExpression) {
  const expression = callExpression.getExpression();
  if (!Node.isIdentifier(expression) || expression.getText() !== "toast") return false;

  const objectArgument = callExpression.getArguments()[0];
  if (!Node.isObjectLiteralExpression(objectArgument)) return false;

  expression.replaceWithText("toast.add");
  const variant = objectArgument.getProperty("variant");
  if (Node.isPropertyAssignment(variant)) {
    const initializer = variant.getInitializer();
    if (!Node.isStringLiteral(initializer)) {
      throw new Error(`variant は文字列リテラルである必要があります: ${variant.getText()}`);
    }
    const value = initializer.getLiteralValue();
    if (value !== "destructive" && value !== "success") {
      throw new Error(`未対応の toast variant: ${value}`);
    }
    variant.getNameNode().replaceWithText("type");
    variant.setInitializer(value === "destructive" ? '"error"' : '"success"');
  }
  return true;
}

function removeLegacyToaster(sourceFile) {
  let wrapped = false;
  const toasterElements = sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
    .filter((node) => node.getTagNameNode().getText() === "Toaster");

  for (const toasterElement of toasterElements) {
    const returnStatement = toasterElement.getFirstAncestorByKind(SyntaxKind.ReturnStatement);
    toasterElement.replaceWithText("");
    const expression = returnStatement?.getExpression();
    if (expression && !expression.getText().trimStart().startsWith("<ToastToaster")) {
      const content = Node.isParenthesizedExpression(expression)
        ? expression.getExpression().getText()
        : expression.getText();
      expression.replaceWithText(`<ToastToaster>\n${content}\n</ToastToaster>`);
      wrapped = true;
    }
  }

  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    if (importDeclaration.getModuleSpecifierValue().endsWith("/toaster")) {
      importDeclaration.remove();
    }
  }
  return wrapped;
}

function ensureToastImport(sourceFile, names) {
  if (names.size === 0) return;
  let importDeclaration = sourceFile
    .getImportDeclarations()
    .find((item) => item.getModuleSpecifierValue() === "@/components/ui/toast");
  if (!importDeclaration) {
    importDeclaration = sourceFile.addImportDeclaration({
      moduleSpecifier: "@/components/ui/toast",
      namedImports: [],
    });
  }
  const existing = new Set(importDeclaration.getNamedImports().map((item) => item.getName()));
  for (const name of names) {
    if (!existing.has(name)) importDeclaration.addNamedImport(name);
  }
}

export function transformToastCalls(source) {
  const project = new Project({
    useInMemoryFileSystem: true,
    manipulationSettings: { quoteKind: QuoteKind.Double },
  });
  const sourceFile = project.createSourceFile("source.tsx", source, {
    scriptKind: ScriptKind.TSX,
  });

  removeLegacyToastImports(sourceFile);
  removeUseToastDeclarations(sourceFile);

  let transformedCall = false;
  for (const callExpression of sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)) {
    transformedCall = transformToastCall(callExpression) || transformedCall;
  }
  const wrapped = removeLegacyToaster(sourceFile);

  const imports = new Set();
  if (transformedCall) imports.add("toast");
  if (wrapped) imports.add("ToastToaster");
  ensureToastImport(sourceFile, imports);

  return sourceFile.getFullText().replace(/[ \t]+$/gm, "");
}

function referenceDependencyVersions() {
  const packageJson = JSON.parse(readFileSync(path.join(REFERENCE_APP, "package.json"), "utf8"));
  return {
    "@base-ui/react": packageJson.dependencies["@base-ui/react"],
    "@tools/design-tokens-elchika": packageJson.dependencies["@tools/design-tokens-elchika"],
    "tw-animate-css": packageJson.dependencies["tw-animate-css"],
  };
}

function migrateComponents(appDir, needsManualWork) {
  const targetDir = path.join(appDir, "src", "components", "ui");
  if (!existsSync(targetDir)) return;

  for (const entry of readdirSync(targetDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".tsx") || entry.name.endsWith(".stories.tsx")) {
      continue;
    }
    const target = path.join(targetDir, entry.name);
    if (entry.name === "toaster.tsx") {
      rmSync(target);
      continue;
    }
    const reference = path.join(REFERENCE_APP, "src", "components", "ui", entry.name);
    if (!existsSync(reference)) {
      needsManualWork.add(`少数派コンポーネント ${entry.name}`);
      continue;
    }
    copyFileSync(reference, target);
  }
}

export function ensureComponentDependencies(appDir) {
  const targetDir = path.join(appDir, "src", "components", "ui");
  const toast = path.join(targetDir, "toast.tsx");
  const button = path.join(targetDir, "button.tsx");
  if (!existsSync(toast) || existsSync(button)) return;
  copyFileSync(path.join(REFERENCE_APP, "src", "components", "ui", "button.tsx"), button);
}

export function migrateButtonTest(appDir) {
  const target = path.join(appDir, "src", "components", "ui", "__tests__", "button.test.tsx");
  if (!existsSync(target)) return;
  const reference = path.join(
    REFERENCE_APP,
    "src",
    "components",
    "ui",
    "__tests__",
    "button.test.tsx",
  );
  copyFileSync(reference, target);
}

function ensureUtils(appDir) {
  const target = path.join(appDir, "src", "lib", "utils.ts");
  if (existsSync(target)) return;
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(path.join(REFERENCE_APP, "src", "lib", "utils.ts"), target);
}

function updateIndexCss(appDir) {
  writeFileSync(path.join(appDir, "src", "index.css"), '@import "@tools/design-tokens-elchika";\n');
}

function updateIndexHtml(appDir) {
  const file = path.join(appDir, "index.html");
  const source = readFileSync(file, "utf8");
  if (source.includes('href="/fonts/fonts.css"')) return;
  if (!source.includes("</head>")) throw new Error(`${file}: </head> がありません`);
  writeFileSync(file, source.replace("</head>", `${FONT_LINK}\n  </head>`));
}

function ensureFontLink(appDir) {
  const publicDir = path.join(appDir, "public");
  const link = path.join(publicDir, "fonts");
  mkdirSync(publicDir, { recursive: true });
  if (existsSync(link)) {
    if (lstatSync(link).isSymbolicLink() && readlinkSync(link) === FONT_LINK_TARGET) return;
    throw new Error(`${link}: 期待した fonts シンボリックリンクではありません`);
  }
  symlinkSync(FONT_LINK_TARGET, link);
}

function updatePackageJson(appDir) {
  const file = path.join(appDir, "package.json");
  const packageJson = JSON.parse(readFileSync(file, "utf8"));
  packageJson.dependencies ??= {};
  for (const dependency of Object.keys(packageJson.dependencies)) {
    if (dependency.startsWith("@radix-ui/") || dependency === "@tools/design-tokens") {
      delete packageJson.dependencies[dependency];
    }
  }
  Object.assign(packageJson.dependencies, referenceDependencyVersions());
  const sortedDependencies = Object.fromEntries(
    Object.entries(packageJson.dependencies).sort(([left], [right]) => left.localeCompare(right)),
  );
  packageJson.dependencies = sortedDependencies;
  writeFileSync(file, `${JSON.stringify(packageJson, null, 2)}\n`);
}

function migrateToast(appDir) {
  const files = globSync(path.join(appDir, "src", "**", "*.{ts,tsx}"));
  for (const file of files) {
    if (file.includes(".stories.") || file.includes(`${path.sep}__tests__${path.sep}`)) continue;
    const source = readFileSync(file, "utf8");
    const transformed = transformToastCalls(source);
    if (transformed !== source) writeFileSync(file, transformed);
  }

  const legacyHook = path.join(appDir, "src", "hooks", "useToast.ts");
  if (existsSync(legacyHook)) rmSync(legacyHook);
  const legacyToaster = path.join(appDir, "src", "components", "ui", "toaster.tsx");
  if (existsSync(legacyToaster)) rmSync(legacyToaster);
}

function listTargetApps(requestedApps) {
  if (requestedApps.length > 0) return requestedApps;
  return readdirSync(APPS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !EXCLUDED_APPS.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function migrateApp(appName) {
  if (EXCLUDED_APPS.has(appName)) {
    console.log(`${appName}: skip（対象外）`);
    return;
  }
  const appDir = path.join(APPS_DIR, appName);
  if (!existsSync(path.join(appDir, "package.json"))) {
    throw new Error(`${appName}: アプリが存在しません`);
  }

  const needsManualWork = new Set();
  migrateComponents(appDir, needsManualWork);
  ensureComponentDependencies(appDir);
  migrateButtonTest(appDir);
  ensureUtils(appDir);
  updateIndexCss(appDir);
  updateIndexHtml(appDir);
  ensureFontLink(appDir);
  updatePackageJson(appDir);
  migrateToast(appDir);

  if (needsManualWork.size > 0) {
    console.log(`${appName}: 要個別処理 -> ${[...needsManualWork].join(", ")}`);
  } else {
    console.log(`${appName}: 成功`);
  }
}

function main() {
  const requestedApps = process.argv.slice(2);
  const apps = listTargetApps(requestedApps);
  const failed = [];
  for (const appName of apps) {
    try {
      migrateApp(appName);
    } catch (error) {
      failed.push(appName);
      console.error(
        `${appName}: 失敗 -> ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
  if (failed.length > 0) {
    console.error(`失敗したアプリ (${failed.length}): ${failed.join(", ")}`);
    process.exit(1);
  }
}

if (process.argv[1] && process.argv[1].endsWith("migrate-to-elchika-ui.js")) {
  main();
}
