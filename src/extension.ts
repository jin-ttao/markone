// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MarkdownEditorPanel } from './panel';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "markone" is now active!');

	// Register the main command for opening the visual markdown editor
	const openEditorCommand = vscode.commands.registerCommand('markone.openEditor', () => {
		// Get the currently active text editor
		const activeEditor = vscode.window.activeTextEditor;
		
		if (!activeEditor) {
			vscode.window.showErrorMessage('No active editor found. Please open a markdown file first.');
			return;
		}

		// Check if the current file is a markdown file
		const document = activeEditor.document;
		if (document.languageId !== 'markdown' && !document.fileName.endsWith('.md')) {
			vscode.window.showErrorMessage('Please open a markdown (.md) file to use the visual editor.');
			return;
		}

		// Create or show the markdown editor panel
		MarkdownEditorPanel.createOrShow(context.extensionUri, document.uri);
	});

	// Register serializer for restoring panels after VS Code restart
	if (vscode.window.registerWebviewPanelSerializer) {
		vscode.window.registerWebviewPanelSerializer(MarkdownEditorPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				// Get the file that was being edited
				if (state && state.sourceUri) {
					MarkdownEditorPanel.revive(webviewPanel, context.extensionUri, vscode.Uri.parse(state.sourceUri));
				}
			}
		});
	}

	// Add context menu command for markdown files
	const contextMenuCommand = vscode.commands.registerCommand('markone.openEditorFromExplorer', (uri: vscode.Uri) => {
		if (uri && (uri.fsPath.endsWith('.md') || uri.fsPath.endsWith('.markdown'))) {
			MarkdownEditorPanel.createOrShow(context.extensionUri, uri);
		} else {
			vscode.window.showErrorMessage('Please select a markdown file.');
		}
	});

	context.subscriptions.push(openEditorCommand, contextMenuCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
