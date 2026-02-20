---
sidebar_position: 2
title: CLAUDE.md 작성법
description: 프로젝트마다 AI의 행동을 커스터마이즈하는 핵심 설정 파일 CLAUDE.md를 완전히 이해하고 작성합니다.
---

# CLAUDE.md 작성법

CLAUDE.md는 Claude Code에게 "이 프로젝트에서는 이렇게 행동해"라고 미리 알려두는 설정 파일입니다. 프롬프트를 매번 반복하지 않아도, 프로젝트의 규칙·컨벤션·주의사항을 영구적으로 기억시킬 수 있습니다.

## 왜 CLAUDE.md인가?

Claude Code를 처음 쓸 때 가장 흔히 하는 실수는 **매 세션마다 같은 컨텍스트를 반복 설명하는 것**입니다.

> "이 프로젝트는 TypeScript야. ESLint 규칙 꼭 지켜줘. 테스트는 Vitest 써. 코드 스타일은 Airbnb야."

이걸 매번 입력하는 건 낭비입니다. CLAUDE.md에 한 번 써두면 Claude Code가 세션 시작 시 자동으로 읽습니다.

## 파일 위치와 우선순위

CLAUDE.md는 여러 위치에 둘 수 있으며, 더 구체적인 위치가 우선합니다.

```
~/.claude/CLAUDE.md          # 전역 설정 (모든 프로젝트 공통)
~/my-project/CLAUDE.md       # 프로젝트 루트 (가장 일반적)
~/my-project/src/CLAUDE.md   # 서브디렉토리 (해당 디렉토리 작업 시만 적용)
```

| 위치 | 적용 범위 | 사용 예시 |
|------|-----------|-----------|
| `~/.claude/CLAUDE.md` | 모든 프로젝트 | 개인 코딩 스타일, 선호 언어 |
| `{project}/CLAUDE.md` | 해당 프로젝트 | 기술 스택, 팀 컨벤션, 아키텍처 |
| `{subdir}/CLAUDE.md` | 특정 모듈 | 마이크로서비스별 규칙 |

:::tip 실용 팁
팀 프로젝트라면 `{project}/CLAUDE.md`를 git에 커밋하세요. 팀 전체가 동일한 AI 행동을 공유할 수 있습니다.
:::

## CLAUDE.md 기본 구조

좋은 CLAUDE.md는 크게 4개 영역으로 구성됩니다.

```markdown
# {프로젝트명}

## 프로젝트 개요
[프로젝트가 무엇인지 1-3문장]

## 기술 스택
[사용 기술, 버전, 중요한 라이브러리]

## 코드 컨벤션
[언어 규칙, 포맷, 네이밍 규칙]

## 주의사항 / 절대 하지 말 것
[잘못하면 큰일 나는 것들]
```

## 실전 예시: Next.js + TypeScript 프로젝트

```markdown
# E-Commerce Platform

## 프로젝트 개요
Next.js 14 (App Router) 기반 B2C 이커머스 플랫폼.
결제는 Stripe, 인증은 NextAuth.js, DB는 PostgreSQL + Prisma 사용.

## 기술 스택
- Next.js 14.2, React 18, TypeScript 5.3
- Tailwind CSS 3.4 (CSS Modules 사용 금지)
- Prisma ORM, PostgreSQL 15
- Vitest (테스트), ESLint + Prettier (포맷)
- pnpm (패키지 매니저) — npm/yarn 사용 금지

## 디렉토리 구조
- `app/` — App Router 페이지 및 레이아웃
- `components/` — 재사용 컴포넌트 (ui/, features/ 구분)
- `lib/` — 유틸리티, DB 클라이언트
- `prisma/` — 스키마, 마이그레이션

## 코드 컨벤션
- 컴포넌트: PascalCase, named export 사용
- 훅: `use` 접두사, `hooks/` 디렉토리
- API Route: RESTful 네이밍, 에러는 항상 `{ error: string }` 형태로 반환
- 타입은 `type` 키워드 사용 (interface 지양)
- async/await 사용, Promise chain(.then) 지양

## 테스트 규칙
- 새 기능마다 Vitest 단위 테스트 필수
- 테스트 파일: `{name}.test.ts` (같은 디렉토리)
- `describe > it` 구조 사용

## 절대 하지 말 것
- `any` 타입 사용 금지 (unknown 또는 정확한 타입 사용)
- `console.log` 프로덕션 코드에 남기지 말 것
- DB 쿼리 직접 작성 금지 — 반드시 Prisma 사용
- `process.env` 직접 접근 금지 — `lib/env.ts` 통해 접근

## 환경 변수
- `DATABASE_URL`: Prisma 연결 문자열
- `NEXTAUTH_SECRET`: NextAuth 시크릿
- `STRIPE_SECRET_KEY`: Stripe 비밀키 (절대 클라이언트에 노출 금지)
```

## 실전 예시: Python FastAPI 프로젝트

```markdown
# ML Inference API

## 개요
PyTorch 모델을 서빙하는 FastAPI 기반 추론 API.
Docker 컨테이너로 배포, GPU 서버에서 실행.

## 기술 스택
- Python 3.11, FastAPI 0.110, Uvicorn
- PyTorch 2.2 (CUDA 12.1)
- Pydantic v2 (v1 문법 사용 금지)
- pytest, ruff (린터), mypy (타입체크)

## 코드 스타일
- 모든 함수에 타입 힌트 필수
- docstring: Google 스타일
- 라인 길이: 88자 (ruff 기본값)
- 클래스명: PascalCase, 함수/변수: snake_case

## API 설계 규칙
- 모든 엔드포인트에 response_model 명시
- 에러: HTTPException, 상태코드 명확히
- 비동기 엔드포인트 우선 (async def)

## 주의
- GPU 메모리 누수 주의: 추론 후 반드시 torch.cuda.empty_cache()
- 모델 가중치 파일(.pt, .pth) git 커밋 금지
```

## 고급 활용: 임포트 설정

CLAUDE.md에서 다른 파일을 참조할 수 있습니다.

```markdown
# My Project

@docs/architecture.md
@docs/api-spec.md

위 문서를 항상 참고해서 답변해줘.
```

`@` 접두사로 파일을 임포트하면 해당 내용도 컨텍스트에 포함됩니다.

## 작성 팁 5가지

**1. 명령형으로 써라**

❌ "TypeScript를 사용하는 프로젝트입니다"
✅ "TypeScript만 사용해. JavaScript 파일 생성 금지"

**2. 부정형(하지 말 것)도 명시해라**

Claude가 하지 말아야 할 것을 명확히 쓰면 실수가 줄어듭니다.

```markdown
## 금지 사항
- 라이브러리 추가 시 반드시 물어볼 것 (임의로 설치 금지)
- 기존 테스트 삭제 금지
- TODO 주석 임의로 제거 금지
```

**3. 기술적 사실만 써라**

"좋은 코드를 써줘"는 의미 없습니다. "함수 하나당 30줄 초과 시 분리할 것"처럼 구체적으로 쓰세요.

**4. 너무 길면 역효과**

CLAUDE.md가 너무 길면 중요한 내용이 묻힙니다. 핵심만 넣고, 상세 스펙은 `@docs/spec.md`로 임포트하세요.

**5. 팀이 함께 관리해라**

CLAUDE.md는 코드 리뷰 대상입니다. 팀원이 PR로 수정하고, 다 같이 검토하는 문화를 만드세요.

## CLAUDE.md 빠른 시작 템플릿

```markdown
# {프로젝트명}

## 한 줄 설명
{이 프로젝트가 뭔지 한 문장}

## 기술 스택
- 언어:
- 프레임워크:
- DB:
- 테스트:
- 패키지 매니저: (이것만 사용, 다른 것 금지)

## 코드 스타일
- {린터/포맷터 및 설정}
- {네이밍 컨벤션}

## 금지 사항
- {절대 하면 안 되는 것}

## 참고 문서
@{관련 문서 경로}
```

이 템플릿을 복사해서 프로젝트에 맞게 채우면 됩니다.

---

다음 챕터: [권한 모드 →](/docs/level-2/permission-modes)
