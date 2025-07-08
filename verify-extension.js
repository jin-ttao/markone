#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 markone 확장 검증 시작...\n');

// 필수 파일 검증
const requiredFiles = [
    'package.json',
    'src/extension.ts',
    'src/panel.ts',
    'dist/extension.js',
    '.vscode/launch.json'
];

console.log('📁 필수 파일 검증:');
let filesOk = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - 파일이 없습니다!`);
        filesOk = false;
    }
});

// package.json 검증
console.log('\n📦 package.json 설정 검증:');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // 명령어 검증
    const commands = packageJson.contributes?.commands || [];
    const hasOpenEditor = commands.some(cmd => cmd.command === 'markone.openEditor');
    const hasContextMenu = commands.some(cmd => cmd.command === 'markone.openEditorFromExplorer');
    
    console.log(`  ${hasOpenEditor ? '✅' : '❌'} markone.openEditor 명령어`);
    console.log(`  ${hasContextMenu ? '✅' : '❌'} markone.openEditorFromExplorer 명령어`);
    
    // 메뉴 설정 검증
    const menus = packageJson.contributes?.menus || {};
    const hasExplorerMenu = menus['explorer/context']?.length > 0;
    const hasEditorMenu = menus['editor/title']?.length > 0;
    
    console.log(`  ${hasExplorerMenu ? '✅' : '❌'} Explorer 컨텍스트 메뉴`);
    console.log(`  ${hasEditorMenu ? '✅' : '❌'} Editor 제목 메뉴`);
    
    // 활성화 이벤트 검증
    const activationEvents = packageJson.activationEvents || [];
    const hasMarkdownActivation = activationEvents.includes('onLanguage:markdown');
    
    console.log(`  ${hasMarkdownActivation ? '✅' : '❌'} 마크다운 활성화 이벤트`);
    
} catch (error) {
    console.log('  ❌ package.json 파싱 오류:', error.message);
    filesOk = false;
}

// 소스 코드 기본 검증
console.log('\n💻 소스 코드 검증:');
try {
    const extensionTs = fs.readFileSync('src/extension.ts', 'utf8');
    const panelTs = fs.readFileSync('src/panel.ts', 'utf8');
    
    const hasActivateFunction = extensionTs.includes('export function activate');
    const hasRegisterCommand = extensionTs.includes('registerCommand');
    const hasPanelClass = panelTs.includes('class MarkdownEditorPanel');
    const hasVditor = panelTs.includes('Vditor');
    
    console.log(`  ${hasActivateFunction ? '✅' : '❌'} activate 함수 존재`);
    console.log(`  ${hasRegisterCommand ? '✅' : '❌'} 명령어 등록`);
    console.log(`  ${hasPanelClass ? '✅' : '❌'} MarkdownEditorPanel 클래스`);
    console.log(`  ${hasVditor ? '✅' : '❌'} Vditor 통합`);
    
} catch (error) {
    console.log('  ❌ 소스 코드 검증 오류:', error.message);
    filesOk = false;
}

// 컴파일된 파일 검증
console.log('\n🔨 컴파일 검증:');
try {
    const compiledJs = fs.readFileSync('dist/extension.js', 'utf8');
    const hasCompiledContent = compiledJs.length > 1000; // 기본적인 크기 검증
    
    console.log(`  ${hasCompiledContent ? '✅' : '❌'} 컴파일된 파일 크기 (${Math.round(compiledJs.length / 1024)}KB)`);
    
} catch (error) {
    console.log('  ❌ 컴파일된 파일 검증 오류:', error.message);
    filesOk = false;
}

// VS Code 설정 검증
console.log('\n⚙️  VS Code 설정 검증:');
try {
    const launchJsonContent = fs.readFileSync('.vscode/launch.json', 'utf8');
    const hasExtensionHost = launchJsonContent.includes('"type": "extensionHost"');
    const hasRunExtension = launchJsonContent.includes('"name": "Run Extension"');
    
    console.log(`  ${hasExtensionHost ? '✅' : '❌'} Extension Host 설정`);
    console.log(`  ${hasRunExtension ? '✅' : '❌'} Run Extension 구성`);
    
} catch (error) {
    console.log('  ❌ launch.json 검증 오류:', error.message);
    filesOk = false;
}

// 최종 결과
console.log('\n' + '='.repeat(50));
if (filesOk) {
    console.log('🎉 모든 검증 통과! 확장이 테스트 준비 완료되었습니다.');
    console.log('\n📋 다음 단계:');
    console.log('1. VS Code에서 이 프로젝트 폴더를 엽니다');
    console.log('2. F5 키를 눌러 Extension Development Host를 실행합니다');
    console.log('3. quick-test.md 또는 test-document.md 파일을 엽니다');
    console.log('4. Command Palette (Ctrl+Shift+P)에서 "Open Visual Markdown Editor"를 실행합니다');
    console.log('5. 에디터에서 내용을 편집하고 Ctrl+S로 저장해보세요');
} else {
    console.log('❌ 일부 검증이 실패했습니다. 위의 오류를 확인하고 수정해주세요.');
}
console.log('='.repeat(50));