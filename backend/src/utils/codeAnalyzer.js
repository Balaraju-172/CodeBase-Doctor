
import * as ts from 'typescript';

// Import TypeScript Compiler API.
// It helps us convert JavaScript/TypeScript code into an AST.

export const analyzeCode = (content, filePath) => {

  // Get the file extension: js, jsx, ts, or tsx.
  const extension = filePath.split('.').pop().toLowerCase();

  // Select the parser mode based on the file extension.
  let scriptKind = ts.ScriptKind.JS;

  if (extension === 'jsx') {
    scriptKind = ts.ScriptKind.JSX;
  } else if (extension === 'ts') {
    scriptKind = ts.ScriptKind.TS;
  } else if (extension === 'tsx') {
    scriptKind = ts.ScriptKind.TSX;
  }

  // Convert the source code into an Abstract Syntax Tree (AST).
  // AST represents code as a structured tree of nodes.
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKind
  );

  // Store the analysis results.
  let functionsFound = 0;

  // Number of import statements.
  let importsFound = 0;

  // Number of individual imported items.
  let importedBindingsFound = 0;

  // Number of export statements/declarations.
  let exportsFound = 0;

  // Store issues detected in this file.
  const potentialIssues = [];

  // Visit every node in the AST recursively.
  const visit = (node) => {

    // Count function declarations, function expressions,
    // arrow functions, methods, constructors and getters/setters.
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

    // Check whether the current AST node is an import statement.
    if (ts.isImportDeclaration(node)) {

      // Count one import statement.
      importsFound++;

      // Get the imported items from this statement.
      const importClause = node.importClause;

      if (importClause) {

        // Count default imports.
        // Example: import express from 'express'
        if (importClause.name) {
          importedBindingsFound++;
        }

        // Check for named imports or namespace imports.
        if (importClause.namedBindings) {

          // Named imports:
          // import { useState, useEffect } from 'react'
          if (ts.isNamedImports(importClause.namedBindings)) {
            importedBindingsFound +=
              importClause.namedBindings.elements.length;
          }

          // Namespace import:
          // import * as React from 'react'
          else if (ts.isNamespaceImport(importClause.namedBindings)) {
            importedBindingsFound++;
          }
        }
      }
    }

    // Count export declarations and export assignments.
    if (
      ts.isExportDeclaration(node) ||
      ts.isExportAssignment(node) ||
      (
        ts.canHaveModifiers(node) &&
        ts.getModifiers(node)?.some(
          (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
        )
      )
    ) {
      exportsFound++;
    }

    // Detect empty catch blocks.
    // Empty catch blocks may silently ignore errors.
    if (
      ts.isCatchClause(node) &&
      node.block.statements.length === 0
    ) {

      // Get the line number where the catch block starts.
      const { line } = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile)
      );

      potentialIssues.push({
        type: 'empty-catch-block',
        message: 'Empty catch block found. Errors may be silently ignored.',
        line: line + 1
      });
    }

    // Continue visiting child nodes.
    ts.forEachChild(node, visit);
  };

  // Start AST traversal from the root node.
  visit(sourceFile);

  // Get syntax errors reported by the TypeScript parser.
  const syntaxErrors = sourceFile.parseDiagnostics.map((diagnostic) => {

    // Find the position of the syntax error.
    const position = diagnostic.start ?? 0;

    const { line, character } =
      sourceFile.getLineAndCharacterOfPosition(position);

    return {
      type: 'syntax-error',
      message: ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
      ),
      line: line + 1,
      column: character + 1
    };
  });

  // Add syntax errors to the list of potential issues.
  potentialIssues.push(...syntaxErrors);

  // Return all analysis results for this file.
  return {
    filePath,
    functionsFound,
    importsFound,
    importedBindingsFound,
    exportsFound,
    potentialIssues
  };
};
