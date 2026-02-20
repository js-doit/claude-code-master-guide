# Claude Code 마스터 가이드

> 설치부터 기업 AI 팀 구축까지 — 한국어로 배우는 Claude Code 완전 정복 플레이북

**[→ 가이드 사이트 바로가기](https://claude-code-master-guide.vercel.app)**

---

## 이 가이드는 무엇인가요?

Claude Code를 한국어로 체계적으로 배울 수 있는 유일한 곳입니다. 공식 문서의 대부분이 영어인 상황에서, 입문자부터 기업 AI 팀을 구축하려는 엔지니어까지 모든 수준의 개발자를 위해 만들어졌습니다.

## 커리큘럼

| 레벨 | 주제 | 내용 |
|------|------|------|
| **L1 — 입문** | 첫 시작 | 설치, API 키, IDE 연동, 기본 명령어 |
| **L2 — 기초** | 실전 워크플로우 | CLAUDE.md, 슬래시 커맨드, Git 연동, 메모리 시스템 |
| **L3 — 중급** | 자동화 | Hooks, MCP 서버, 비용 최적화, CI/CD 통합 |
| **L4 — 고급** | 확장 | 커스텀 스킬, Agent SDK, 대규모 코드베이스 전략 |
| **L5 — 마스터** | 엔터프라이즈 | 멀티에이전트 시스템, 기업 AI 팀 구축 |
| **캡스톤** | 실전 프로젝트 | 기업 멀티에이전트 아키텍처 구현 |

## 로컬에서 실행하기

```bash
# 저장소 클론
git clone https://github.com/js-doit/claude-code-master-guide.git
cd claude-code-master-guide

# 의존성 설치
npm install

# 개발 서버 시작 (http://localhost:3000)
npm start

# 프로덕션 빌드
npm run build
```

## 기술 스택

- [Docusaurus 3.x](https://docusaurus.io/) — 정적 사이트 생성기
- React 19, Node.js 20+
- Vercel — 배포

## 기여하기

오타 수정, 내용 보완, 번역 등 모든 기여를 환영합니다.

1. 이 저장소를 Fork
2. 브랜치 생성: `git checkout -b fix/오타-수정`
3. 변경 후 PR 생성

## 라이선스

MIT License — 자유롭게 사용, 수정, 배포할 수 있습니다.
