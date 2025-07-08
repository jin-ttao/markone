import * as vscode from 'vscode';
import * as path from 'path';

export class MarkdownEditorPanel {
    public static currentPanel: MarkdownEditorPanel | undefined;
    public static readonly viewType = 'markdownEditor';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private readonly _sourceUri: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri, sourceUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        if (MarkdownEditorPanel.currentPanel) {
            MarkdownEditorPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            MarkdownEditorPanel.viewType,
            'Visual Markdown Editor',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.joinPath(extensionUri, 'out', 'compiled')
                ]
            }
        );

        MarkdownEditorPanel.currentPanel = new MarkdownEditorPanel(panel, extensionUri, sourceUri);
    }

    public static revive(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, sourceUri: vscode.Uri) {
        MarkdownEditorPanel.currentPanel = new MarkdownEditorPanel(panel, extensionUri, sourceUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, sourceUri: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._sourceUri = sourceUri;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            (e: vscode.WebviewPanelOnDidChangeViewStateEvent) => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            (message: any) => {
                switch (message.command) {
                    case 'save':
                        this._saveContent(message.content);
                        return;
                    case 'getContent':
                        this._sendInitialContent();
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    private async _saveContent(content: string) {
        try {
            const document = await vscode.workspace.openTextDocument(this._sourceUri);
            const edit = new vscode.WorkspaceEdit();
            edit.replace(
                this._sourceUri,
                new vscode.Range(0, 0, document.lineCount, 0),
                content
            );
            await vscode.workspace.applyEdit(edit);
            await document.save();
            vscode.window.showInformationMessage('Markdown file saved successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to save: ${error}`);
        }
    }

    private async _sendInitialContent() {
        try {
            const document = await vscode.workspace.openTextDocument(this._sourceUri);
            const content = document.getText();
            this._panel.webview.postMessage({
                command: 'setContent',
                content: content
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load content: ${error}`);
        }
    }

    public dispose() {
        MarkdownEditorPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _update() {
        const webview = this._panel.webview;
        this._panel.title = `Visual Editor - ${path.basename(this._sourceUri.fsPath)}`;
        this._panel.webview.html = this._getHtmlForWebview(webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Markdown Editor</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vditor@3.9.9/dist/index.css" />
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #vditor {
            height: 100vh;
        }
        .vditor-toolbar {
            background-color: var(--vscode-editor-background);
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .vditor-content {
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
    </style>
</head>
<body>
    <div id="vditor"></div>
    
    <script src="https://cdn.jsdelivr.net/npm/vditor@3.9.9/dist/index.min.js"></script>
    <script>
        const vscode = acquireVsCodeApi();
        let vditor;

        // Initialize Vditor
        function initVditor() {
            vditor = new Vditor('vditor', {
                height: window.innerHeight,
                mode: 'wysiwyg',
                toolbar: [
                    'emoji',
                    'headings',
                    'bold',
                    'italic',
                    'strike',
                    'link',
                    'list',
                    'ordered-list',
                    'check',
                    'quote',
                    'line',
                    'code',
                    'inline-code',
                    'table',
                    'undo',
                    'redo',
                    {
                        name: 'save',
                        tip: 'Save (Ctrl+S)',
                        tipPosition: 's',
                        icon: '<svg><use xlink:href="#vditor-icon-save"></use></svg>',
                        click: () => {
                            saveContent();
                        }
                    }
                ],
                after: () => {
                    // Request initial content after Vditor is ready
                    vscode.postMessage({ command: 'getContent' });
                },
                input: (value) => {
                    // Auto-save could be implemented here
                    // For now, we'll only save on explicit save action
                },
                cache: {
                    enable: false
                },
                theme: 'dark'
            });
        }

        // Save content function
        function saveContent() {
            const content = vditor.getValue();
            vscode.postMessage({
                command: 'save',
                content: content
            });
        }

        // Handle messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'setContent':
                    if (vditor) {
                        vditor.setValue(message.content);
                    }
                    break;
            }
        });

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveContent();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (vditor) {
                vditor.resize();
            }
        });

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', initVditor);
    </script>
</body>
</html>`;
    }
}