# markone - VS Code WYSIWYG Markdown Editor

A Visual Studio Code extension that provides a WYSIWYG (What You See Is What You Get) markdown editor using [Vditor](https://b3log.org/vditor/).

## 🚀 Features

- **WYSIWYG Editing**: Edit markdown files visually without dealing with raw markdown syntax
- **Real-time Sync**: Changes in the visual editor are synchronized with the original markdown file
- **Rich Toolbar**: Full-featured toolbar with common markdown formatting options
- **Save Support**: Save your changes using Ctrl+S (Cmd+S on Mac) or the save button
- **Context Menu**: Right-click on .md files in explorer to open with visual editor
- **Editor Integration**: Button in editor title bar for quick access when viewing markdown files

## 📦 Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press F5 to open a new VS Code window with the extension loaded

## 🎯 Usage

### Opening the Visual Editor

There are multiple ways to open the visual markdown editor:

1. **Command Palette**: 
   - Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
   - Type "Open Visual Markdown Editor"
   - Press Enter

2. **Explorer Context Menu**:
   - Right-click on any .md file in the Explorer
   - Select "Open with Visual Markdown Editor"

3. **Editor Title Bar**:
   - Open any markdown file
   - Click the "Open Visual Markdown Editor" button in the editor title bar

### Editing and Saving

- Edit your markdown content using the visual interface
- Use the toolbar for formatting (headings, bold, italic, lists, etc.)
- Save your changes using:
  - Ctrl+S (Cmd+S on Mac) keyboard shortcut
  - Click the Save button in the toolbar
- Changes are automatically applied to the original markdown file

## 🛠️ Technical Details

### Architecture

- **Extension Entry Point**: `src/extension.ts` - Registers commands and handles VS Code integration
- **Panel Management**: `src/panel.ts` - Manages WebView panels and communication
- **Editor UI**: Embedded HTML with [Vditor](https://b3log.org/vditor/) library loaded via CDN

### Communication Flow

1. User triggers the "Open Visual Markdown Editor" command
2. Extension reads the current markdown file content
3. WebView panel is created with Vditor editor
4. Initial content is loaded into the visual editor
5. User edits content in WYSIWYG mode
6. On save, content is sent back to extension and written to file

## 🔧 Development

### Prerequisites

- Node.js (v14 or higher)
- VS Code (v1.101.0 or higher)

### Setup

```bash
# Install dependencies
npm install

# Compile the extension
npm run compile

# Watch for changes during development
npm run watch
```

### Testing

1. Press F5 to open a new Extension Development Host window
2. Open or create a .md file
3. Test the extension functionality

## 📁 Project Structure

```
markone/
├── src/
│   ├── extension.ts      # Main extension entry point
│   ├── panel.ts          # WebView panel management
│   └── test/             # Test files
├── package.json          # Extension manifest
├── tsconfig.json         # TypeScript configuration
├── esbuild.js           # Build configuration
└── README.md            # This file
```

## 🎨 Features in Detail

### Supported Markdown Elements

- **Headings**: H1-H6 headings with visual hierarchy
- **Text Formatting**: Bold, italic, strikethrough
- **Lists**: Ordered and unordered lists with nesting
- **Links**: Clickable links with easy editing
- **Images**: Image embedding and display
- **Code**: Inline code and code blocks with syntax highlighting
- **Tables**: Visual table editing
- **Quotes**: Blockquotes with proper formatting
- **Horizontal Rules**: Visual dividers

### VS Code Integration

- **Theme Awareness**: Respects VS Code's dark/light theme settings
- **File Management**: Seamless integration with VS Code's file system
- **Error Handling**: Proper error messages and graceful degradation
- **Context Menus**: Native VS Code context menu integration

## 🚧 Roadmap

Future features planned for development:

- [ ] Dark mode theme improvements
- [ ] Advanced table editing capabilities
- [ ] Math equation support
- [ ] Custom toolbar configuration
- [ ] Auto-save functionality
- [ ] Multiple file tabs support
- [ ] Export options (HTML, PDF)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Vditor](https://b3log.org/vditor/) - The excellent WYSIWYG markdown editor library
- [VS Code Extension API](https://code.visualstudio.com/api) - Microsoft's comprehensive extension platform
