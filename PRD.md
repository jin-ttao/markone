🧾 PRD: markone — VS Code WYSIWYG Markdown Editor Extension (MVP)

📌 목적 (Goal)

VS Code 내에서 .md 파일을 하나의 탭에서 WYSIWYG 방식으로 시각적으로 편집할 수 있도록 지원하는 확장을 개발한다. 기존 Split View의 불편함을 해소하고, 미리보기와 편집을 통합하여 마크다운 UX를 향상시킨다.

⸻

🔧 기능 정의 (Feature Spec)

✅ 1. 명령어 실행으로 마크다운 에디터 열기
	•	명령어 이름: markone.openEditor
	•	표시 이름: Open Visual Markdown Editor
	•	동작:
	•	현재 열려 있는 .md 파일의 콘텐츠를 읽어들임
	•	WebView 패널을 생성해 시각 편집기 UI 렌더링

✅ 2. WebView 기반 WYSIWYG 편집기
	•	렌더링 방식: HTML 기반 WebView에 Vditor 포함
	•	제공 요소:
	•	제목 (#), 리스트 (-), 링크, 굵게 등 기본 마크다운
	•	툴바 포함한 리치 텍스트 UI

✅ 3. 양방향 동기화
	•	초기 콘텐츠: .md 파일에서 읽어와 WebView로 전달
	•	편집 내용: WebView 상에서 편집 시, 변경 사항을 .md 파일에 실시간으로 저장 (or 저장 버튼 누르면 저장)

✅ 4. 기본 저장 로직
	•	저장 트리거: 사용자가 툴바 or 단축키로 저장 명령 시
	•	저장 방식: WebView → 확장 → TextDocument에 쓰기

⸻

📁 파일 구조 (기본 scaffold)

📁 markone/
├── 📁 src/
│   ├── extension.ts          // VS Code 확장 진입점
│   ├── panel.ts              // WebView 생성 및 통신 처리
│   └── webview.html          // WebView 내 UI 정의 (CDN으로 Vditor 로드)
├── package.json              // 명령어 및 활성화 이벤트 정의
└── README.md                 // 프로젝트 설명


⸻

🔗 WebView 관련 통신 구조

sequenceDiagram
    participant VSCode
    participant Extension
    participant WebView

    VSCode->>Extension: 사용자 명령어 실행
    Extension->>WebView: 초기 마크다운 내용 전달
    WebView->>User: 에디터 UI 표시
    User->>WebView: 내용 편집
    WebView->>Extension: 저장 요청 postMessage
    Extension->>VSCode: TextDocument 갱신


⸻

🧪 테스트 시나리오

시나리오	기대 동작
명령어 실행 시	WebView 패널 생성되고, 현재 .md 내용 로딩됨
에디터에서 내용 수정	실시간 반영되거나 저장 시 .md 파일에 반영됨
저장 단축키 누름	파일 저장됨 (Cmd/Ctrl + S or 버튼)


⸻

🛠️ 후속 기능 (MVP 이후 고려)
	•	다크모드 지원
	•	마크다운 문법 숨김 모드
	•	GPT 슬래시 명령 (/summarize, /todo)
	•	테이블 / 코드 블럭 고급 편집기
	•	Obsidian-style 폴더 구조 탐색기
