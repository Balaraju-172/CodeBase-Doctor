
import * as ts from 'typescript';

export const analyzeDependencies = (content, filePath) => {

  // Step 1: Identify file extension
  const extension = filePath.split('.').pop().toLowerCase();

  // Step 2: Identify TypeScript parser type
  let scriptKind = ts.ScriptKind.JS;

  if (extension === 'jsx') {
    scriptKind = ts.ScriptKind.JSX;
  } else if (extension === 'ts') {
    scriptKind = ts.ScriptKind.TS;
  } else if (extension === 'tsx') {
    scriptKind = ts.ScriptKind.TSX;
  }

  // Step 3: Convert source code into AST
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  // Step 4: Store dependencies
  const dependencies = [];

  // Step 5: Traverse AST nodes
  const visit = (node) => {

    // Identify normal import statements
    if (ts.isImportDeclaration(node)) {
      const specifier = node.moduleSpecifier.text;

      const { line } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile)
      );

      dependencies.push({
        specifier,
        type: specifier.startsWith('.') ? 'local' : 'external',
        line: line + 1
      });
    }

    // Identify re-export statements
    if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      const specifier = node.moduleSpecifier.text;

      const { line } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile)
      );

      dependencies.push({
        specifier,
        type: specifier.startsWith('.') ? 'local' : 'external',
        line: line + 1
      });
    }

    // Visit child nodes
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  // Step 6: Return dependency information
  return {
    filePath,
    dependenciesFound: dependencies.length,
    dependencies
  };
};
