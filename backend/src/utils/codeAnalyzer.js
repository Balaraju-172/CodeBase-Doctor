
import * as ts from 'typescript';

export const analyzeCode = (content, filePath) => {
  // Step 1: Identify file extension
  const extension = filePath.split('.').pop().toLowerCase();

  let scriptKind = ts.ScriptKind.JS;

  if (extension === 'jsx') {
    scriptKind = ts.ScriptKind.JSX;
  } else if (extension === 'ts') {
    scriptKind = ts.ScriptKind.TS;
  } else if (extension === 'tsx') {
    scriptKind = ts.ScriptKind.TSX;
  }

  // Step 2: Convert source code into AST
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  let functionsFound = 0;
  let importsFound = 0;
  let importedBindingsFound = 0;
  let exportsFound = 0;

  const potentialIssues = [];

  // Helper: Get line number for an AST node
  const getLine = (node) => {
    const { line } = sourceFile.getLineAndCharacterOfPosition(
      node.getStart(sourceFile)
    );

    return line + 1;
  };

  // Step 3: Visit AST nodes
  const visit = (node) => {

    // Count functions
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node) ||
      ts.isConstructorDeclaration(node) ||
      ts.isGetAccessorDeclaration(node) ||
      ts.isSetAccessorDeclaration(node)
    ) {
      functionsFound++;
    }

    // Count imports
    if (ts.isImportDeclaration(node)) {
      importsFound++;

      const importClause = node.importClause;

      if (importClause) {
        if (importClause.name) {
          importedBindingsFound++;
        }

        if (importClause.namedBindings) {
          if (ts.isNamedImports(importClause.namedBindings)) {
            importedBindingsFound +=
              importClause.namedBindings.elements.length;
          } else if (
            ts.isNamespaceImport(importClause.namedBindings)
          ) {
            importedBindingsFound++;
          }
        }
      }
    }

    // Count exports
    if (
      ts.isExportDeclaration(node) ||
      ts.isExportAssignment(node) ||
      (
        ts.canHaveModifiers(node) &&
        ts.getModifiers(node)?.some(
          (modifier) =>
            modifier.kind === ts.SyntaxKind.ExportKeyword
        )
      )
    ) {
      exportsFound++;
    }

    // Rule 1: Empty catch block
    if (
      ts.isCatchClause(node) &&
      node.block.statements.length === 0
    ) {
      potentialIssues.push({
        type: 'empty-catch-block',
        severity: 'medium',
        message: 'Empty catch block found. Errors may be silently ignored.',
        line: getLine(node)
      });
    }

    // Rule 2: Debugger statement
    if (ts.isDebuggerStatement(node)) {
      potentialIssues.push({
        type: 'debugger-statement',
        severity: 'medium',
        message: 'Debugger statement found. Remove it before production.',
        line: getLine(node)
      });
    }

    // Rule 3: Console method calls
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === 'console'
    ) {
      potentialIssues.push({
        type: 'console-statement',
        severity: 'low',
        message: `Console.${node.expression.name.text}() call found. Check whether this debug log is needed.`,
        line: getLine(node)
      });
    }

    // Rule 4: var declarations
    if (
      ts.isVariableDeclarationList(node) &&
      (node.flags & ts.NodeFlags.Var) !== 0
    ) {
      potentialIssues.push({
        type: 'var-usage',
        severity: 'low',
        message: 'var declaration found. Consider using let or const.',
        line: getLine(node)
      });
    }

    // Visit child nodes
    ts.forEachChild(node, visit);
  };

  // Start traversal
  visit(sourceFile);

  // Step 4: Detect syntax errors
  const syntaxErrors = sourceFile.parseDiagnostics.map(
    (diagnostic) => {
      const position = diagnostic.start ?? 0;

      const { line, character } =
        sourceFile.getLineAndCharacterOfPosition(position);

      return {
        type: 'syntax-error',
        severity: 'high',
        message: ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n'
        ),
        line: line + 1,
        column: character + 1
      };
    }
  );

  potentialIssues.push(...syntaxErrors);

  // Step 5: Return analysis results
  return {
    filePath,
    functionsFound,
    importsFound,
    importedBindingsFound,
    exportsFound,
    potentialIssues
  };
};
