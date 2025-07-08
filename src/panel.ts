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

        // Detect VS Code theme
        function getVsCodeTheme() {
            const body = document.body;
            const computedStyle = getComputedStyle(body);
            const bgColor = computedStyle.getPropertyValue('--vscode-editor-background');
            // If background is dark, use dark theme
            if (bgColor && bgColor.includes('rgb')) {
                const rgb = bgColor.match(/\d+/g);
                if (rgb) {
                    const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
                    return brightness < 128 ? 'dark' : 'classic';
                }
            }
            return 'classic'; // default to light theme
        }

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
                        icon: '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3M19,19H5V5H16.17L19,7.83V19M12,12A3,3 0 0,0 9,15A3,3 0 0,0 12,18A3,3 0 0,0 15,15A3,3 0 0,0 12,12M6,6V10H15V6H6Z"/></svg>',
                        click: () => {
                            saveContent();
                        }
                    }
                ],
                after: () => {
                    // Request initial content after Vditor is ready
                    vscode.postMessage({ command: 'getContent' });
                    
                    // If there's pending content, set it now
                    if (window.pendingContent) {
                        try {
                            vditor.setValue(window.pendingContent);
                            window.pendingContent = null;
                        } catch (error) {
                            console.error('Failed to set pending content:', error);
                        }
                    }
                },
                input: (value) => {
                    // Auto-save could be implemented here
                    // For now, we'll only save on explicit save action
                },
                cache: {
                    enable: false
                },
                theme: getVsCodeTheme()
            }).catch(error => {
                console.error('Failed to initialize Vditor:', error);
                document.getElementById('vditor').innerHTML = 
                    '<div style="padding: 20px; text-align: center; color: var(--vscode-errorForeground);">' +
                    '<h3>Failed to load Markdown Editor</h3>' +
                    '<p>Please check your internet connection and try again.</p>' +
                    '<p>Error: ' + error.message + '</p>' +
                    '</div>';
            });
        }

        // Save content function
        function saveContent() {
            if (!vditor) {
                console.error('Vditor is not initialized');
                return;
            }
            
            try {
                const content = vditor.getValue();
                vscode.postMessage({
                    command: 'save',
                    content: content
                });
            } catch (error) {
                console.error('Failed to get content from Vditor:', error);
            }
        }

        // Handle messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'setContent':
                    if (vditor) {
                        try {
                            vditor.setValue(message.content);
                        } catch (error) {
                            console.error('Failed to set content in Vditor:', error);
                        }
                    } else {
                        // Store content to set later when Vditor is ready
                        window.pendingContent = message.content;
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