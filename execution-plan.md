# 실행 계획: Claude Code 마스터 가이드 웹사이트

## 프로젝트 기본 정보

- **프로젝트명**: claude-code-master-guide
- **GitHub**: https://github.com/js-doit/claude-code-master-guide
- **배포**: Vercel (https://claude-code-master-guide.vercel.app)
- **기술 스택**: Docusaurus 3.x + JavaScript + Vercel

---

## 구현 순서 (효율적 순서)

### Phase 1 — 프로젝트 셋업 ✅ 진행 중
> 목표: 로컬 실행 + Vercel 배포까지 완료 (뼈대 먼저)

- [x] Node.js 설치
- [x] Docusaurus 프로젝트 생성 (`claude-code-master-guide`)
- [x] `docusaurus.config.js` 커스터마이징 (사이트명, i18n, 한국어 설정)
- [x] `sidebars.js` 전체 구조 설정
- [x] docs 폴더 구조 생성 (level-1 ~ level-5, capstone)
- [x] 홈페이지(랜딩) 제작 — 3가지 진입 경로
- [x] 커스텀 CSS (브랜드 컬러)
- [x] `docs/intro.md` 시작하기 페이지
- [x] 각 레벨 `intro.md` 플레이스홀더 생성
- [x] 로컬 빌드 테스트 (`npm run build`)

### Phase 2 — GitHub + Vercel 배포
> 목표: Soft Launch URL 확보

- [ ] GitHub 저장소 생성 (`claude-code-master-guide`, public)
- [ ] `.gitignore` 설정
- [ ] `git init` → `git add` → 첫 커밋
- [ ] GitHub push
- [ ] Vercel 연결 (GitHub repo import)
- [ ] Vercel 자동 배포 확인
- [ ] 커스텀 도메인 설정 (선택, 나중에)

### Phase 3 — 레벨 1 콘텐츠 (M1 달성)
> 목표: 입문자가 설치부터 첫 실행까지 완주 가능

- [x] `level-1/what-is-claude-code.md` — Claude Code 소개, vs Cursor/Copilot
- [x] `level-1/installation.md` — Windows/Mac/Linux 설치 가이드
- [x] `level-1/api-key-setup.md` — API 키 발급 및 환경변수
- [x] `level-1/ide-integration.md` — VS Code, JetBrains 연동
- [x] `level-1/first-run.md` — 첫 번째 실행 실습
- [x] `level-1/basic-commands.md` — 기본 명령어 실습

### Phase 4 — 레벨 2 콘텐츠 (M1 완성)
> 목표: Soft Launch 가능한 볼륨 확보

- [ ] `level-2/claude-md.md` — CLAUDE.md 작성법
- [ ] `level-2/permission-modes.md` — 권한 모드
- [ ] `level-2/git-integration.md` — Git 연동
- [ ] `level-2/slash-commands.md` — 슬래시 커맨드 완전 정복
- [ ] `level-2/context-management.md` — 컨텍스트 관리
- [ ] `level-2/memory-system.md` — 메모리 시스템
- [ ] `level-2/multi-file.md` — 멀티파일 전략

### Phase 5 — 레벨 3 콘텐츠 (M2 달성)
> 목표: 공개 홍보 가능한 중급 콘텐츠

- [ ] `level-3/hooks.md` — Hooks 시스템
- [ ] `level-3/mcp-servers.md` — MCP 서버 연결
- [ ] `level-3/multi-model-strategy.md` — 멀티 모델 전략
- [ ] `level-3/cost-optimization.md` — 비용 최적화
- [ ] `level-3/test-automation.md` — 테스트 자동화
- [ ] `level-3/cicd-integration.md` — CI/CD 통합
- [ ] `level-3/large-codebase.md` — 대규모 코드베이스
- [ ] `level-3/troubleshooting.md` — 트러블슈팅
- [ ] `level-3/prompting-strategy.md` — 프롬프트 전략
- [ ] Algolia DocSearch 연동

### Phase 6 — 레벨 4~5 콘텐츠 (M3 달성)
> 목표: v1.0 정식 론칭 + 이메일 게이트 적용

- [ ] 레벨 4 전체 챕터 작성
- [ ] 레벨 5 전체 챕터 작성
- [ ] 이메일 게이트 구현 (레벨 4~5 진입 시 이메일 등록)
- [ ] 부록: reference.md, faq.md, glossary.md

### Phase 7 — 캡스톤 프로젝트 (M4 달성)
> 목표: 기업 팀 에이전트 시스템 완성 → 전자책 출간 준비

- [ ] `capstone/overview.md` — 프로젝트 개요 및 아키텍처
- [ ] `capstone/ceo-orchestrator.md` — CEO 오케스트레이터
- [ ] 각 부서별 에이전트 챕터 (7개)
- [ ] `capstone/templates.md` — 스타트업/중소기업/엔터프라이즈 템플릿

### Phase 8 — 글로벌 확장 (M5)
> 목표: 영어 번역 추가

- [ ] i18n/en 디렉토리 생성
- [ ] 주요 챕터 영어 번역
- [ ] 언어 전환 테스트

---

## 현재 파일 구조

```
claude-code-master-guide/
├── docs/
│   ├── intro.md                    ← 시작하기 (메인 진입점)
│   ├── level-1/                    ← 입문
│   │   ├── intro.md
│   │   ├── what-is-claude-code.md
│   │   ├── installation.md
│   │   ├── api-key-setup.md
│   │   ├── ide-integration.md
│   │   ├── first-run.md
│   │   └── basic-commands.md
│   ├── level-2/                    ← 기초
│   ├── level-3/                    ← 중급
│   ├── level-4/                    ← 고급
│   ├── level-5/                    ← 마스터
│   ├── capstone/                   ← 기업 팀 에이전트
│   ├── reference.md
│   ├── faq.md
│   └── glossary.md
├── blog/                           ← 업데이트 소식
├── src/
│   ├── pages/
│   │   └── index.js                ← 랜딩 페이지
│   └── css/
│       └── custom.css              ← 브랜드 스타일
├── static/
│   └── img/
├── docusaurus.config.js            ✅ 완료
└── sidebars.js                     ✅ 완료
```

---

## 브랜드 컬러 가이드

```css
/* 메인 컬러: Claude 브랜드 기반 */
--primary: #D97706      /* 앰버/골드 — 지식, 프리미엄 */
--primary-dark: #B45309
--secondary: #1E3A5F    /* 딥 네이비 — 신뢰, 전문성 */
--accent: #10B981       /* 에메랄드 — 성장, 완료 */
--bg-light: #FAFAF8
--code-bg: #1E1E2E      /* 다크 코드 블록 */
```

---

## 챕터 작성 템플릿

모든 챕터는 다음 구조를 따른다:

```markdown
---
sidebar_position: N
title: 챕터 제목
description: SEO용 설명 (1~2문장)
---

# 챕터 제목

> 💡 **이 챕터에서 배우는 것**: 핵심 학습 목표 1~3개

:::info 전제 지식
이 챕터를 시작하기 전에 필요한 사전 지식. 없으면 생략.
:::

## 개요
...

## 실습
```코드 예시```

## 핵심 정리
- 요점 1
- 요점 2

## 다음 단계
→ [다음 챕터 이름](/docs/...)
```

---

## 체크리스트 (현재 상태)

- [x] Node.js 설치
- [x] Docusaurus 프로젝트 생성
- [x] docusaurus.config.js 설정
- [x] sidebars.js 전체 구조 설정
- [x] docs 폴더 구조 생성
- [x] 홈페이지(랜딩) 제작
- [x] 커스텀 CSS
- [x] placeholder 문서 생성
- [x] 로컬 빌드 테스트
- [ ] GitHub 저장소 생성
- [ ] Vercel 배포
