# Claude Code 마스터 가이드

## 프로젝트 개요

Claude Code 한국어 완전 정복 플레이북. Docusaurus 3.x 기반 정적 사이트.

- **GitHub**: github.com/js-doit/claude-code-master-guide
- **배포**: Vercel (https://claude-code-master-guide.vercel.app)
- **패키지 매니저**: npm (yarn, pnpm 사용 금지)

## 기술 스택

- Docusaurus 3.9.2, React 19, Node.js 20+
- 빌드: `npm run build` | 개발 서버: `npm start`
- i18n: 한국어(기본), 영어(준비 중)

## 디렉토리 구조

```
docs/
  intro.md, faq.md, glossary.md, reference.md
  level-1/    — 입문 (6챕터, ✅ 완료)
  level-2/    — 기초 (7챕터, ✅ 완료)
  level-3/    — 중급 (9챕터, ✅ 완료)
  level-4/    — 고급 (8챕터, ✅ 완료)
  level-5/    — 마스터 (6챕터, ✅ 완료)
  capstone/   — 기업 캡스톤 (10챕터, ✅ 완료)
blog/         — 업데이트 소식
src/
  pages/index.js     — 랜딩 페이지 (Hero, Stats, Paths, Roadmap)
  css/custom.css     — 디자인 시스템 (--cc-* CSS 변수)
```

## 콘텐츠 작성 규칙

- **언어**: 한국어만. 영어 콘텐츠 임의 추가 금지
- **frontmatter**: sidebar_position, title, description 필수
- **챕터 끝**: `---\n다음 챕터: [제목 →](/docs/...)` 형식으로 마무리
- **admonition**: :::tip / :::warning / :::caution 적극 활용
- **코드 예시**: 실제 동작 가능한 것만 포함
- **링크**: 추가 전 반드시 해당 파일 존재 여부 확인 (깨진 링크 = 빌드 실패)

## 현재 진행 상황

- ✅ Level 1 — 입문 (6챕터 완료)
- ✅ Level 2 — 기초 (7챕터 완료)
- ✅ Level 3 — 중급 (9챕터 완료)
- ✅ Level 4 — 고급 (8챕터 완료)
- ✅ Level 5 — 마스터 (6챕터 완료)
- ✅ Capstone — 기업 팀 에이전트 (10챕터 완료)

## 금지 사항

- `docusaurus.config.js`의 url, organizationName, projectName 변경 금지
- `execution-plan.md`, `PRD-instruction.md` 수정 금지 (기획 원본)
- `showLastUpdateTime: true` — git 저장소 없는 환경에서 false로 변경 후 작업
- 새 페이지/챕터 링크 추가 시 빌드 테스트 필수

## 커밋 메시지 규칙

Conventional Commits 형식:
- `docs(level-N): 챕터명 작성`
- `feat: 기능 추가`
- `fix: 빌드 오류 수정`
- `design: 디자인 변경`
