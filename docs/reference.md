---
sidebar_position: 1
title: 빠른 참조
description: Claude Code 핵심 명령어, 슬래시 커맨드, 단축키, 환경변수를 한눈에 정리한 치트시트
---

# 📖 빠른 참조

Claude Code 사용 시 가장 자주 찾는 명령어와 설정을 한 곳에 모았습니다.

---

## 기본 실행

```bash
claude                    # 대화형 모드 시작
claude "작업 내용"         # 단일 프롬프트 실행
claude -p "프롬프트"       # --print 모드 (결과만 출력)
claude --continue         # 마지막 대화 이어서
claude --resume           # 세션 선택 후 재개
claude --model sonnet     # 모델 지정
claude --no-stream        # 스트리밍 비활성화
```

---

## 슬래시 커맨드

| 커맨드 | 설명 |
|--------|------|
| `/help` | 도움말 표시 |
| `/clear` | 현재 대화 내용 초기화 |
| `/compact` | 대화 요약 후 컨텍스트 절약 |
| `/memory` | CLAUDE.md 파일 편집 |
| `/cost` | 현재 세션 누적 비용 확인 |
| `/model` | 사용 모델 변경 |
| `/permissions` | 도구 권한 설정 확인 |
| `/status` | 현재 시스템 상태 확인 |
| `/review` | 최근 변경사항 코드 리뷰 요청 |
| `/init` | CLAUDE.md 초기 생성 |

---

## 권한 모드

| 모드 | 명령어 | 설명 |
|------|--------|------|
| 기본 | `claude` | 각 작업마다 승인 요청 |
| 자동 승인 | `claude --dangerously-skip-permissions` | 모든 작업 자동 실행 |
| 읽기 전용 | 권한 설정에서 Write 비활성화 | 파일 수정 불가 |

:::caution
`--dangerously-skip-permissions`는 신뢰할 수 있는 환경(Docker, CI)에서만 사용하세요.
:::

---

## CLAUDE.md 템플릿

```markdown
# 프로젝트명

## 기술 스택
- 언어: TypeScript
- 프레임워크: Next.js
- 패키지 매니저: npm

## 코딩 규칙
- 함수명: camelCase
- 파일명: kebab-case
- 들여쓰기: 2 스페이스

## 자주 쓰는 명령어
- 개발 서버: `npm run dev`
- 빌드: `npm run build`
- 테스트: `npm test`

## 현재 진행 상황
- ✅ 완료된 작업
- 🔄 진행 중
- ⬜ 예정
```

---

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `ANTHROPIC_API_KEY` | API 인증 키 (필수) | — |
| `CLAUDE_MODEL` | 기본 모델 설정 | `claude-sonnet-4-6` |
| `CLAUDE_MAX_TOKENS` | 최대 토큰 수 | 모델 기본값 |
| `HTTP_PROXY` / `HTTPS_PROXY` | 프록시 설정 | — |
| `NODE_TLS_REJECT_UNAUTHORIZED` | TLS 검증 비활성화 (`0`) | `1` |

---

## 모델 선택 가이드

| 모델 | 용도 | 상대 비용 |
|------|------|----------|
| `claude-haiku-4-5` | 빠른 작업, 대량 처리 | 저렴 |
| `claude-sonnet-4-6` | 일반 개발 (기본 권장) | 중간 |
| `claude-opus-4-6` | 복잡한 설계, Extended Thinking | 비쌈 |

---

## Hooks 이벤트 종류

| 이벤트 | 발생 시점 |
|--------|----------|
| `PreToolUse` | 도구 실행 직전 |
| `PostToolUse` | 도구 실행 직후 |
| `Notification` | Claude가 알림 보낼 때 |
| `Stop` | 응답 완료 후 |
| `SubagentStop` | 서브에이전트 완료 후 |

---

## Agent SDK 빠른 참조

```typescript
import { query } from "@anthropic-ai/claude-code";

// 기본 실행
const response = await query({
  prompt: "작업 내용",
  options: {
    maxTurns: 10,
    allowedTools: ["Read", "Write", "Bash"],
    systemPrompt: "당신은 전문가입니다."
  }
});

// 응답 텍스트 추출
const text = response
  .filter(m => m.type === "assistant")
  .flatMap(m => m.content)
  .filter(b => b.type === "text")
  .map(b => b.text)
  .join("\n");
```

---

## 자주 쓰는 프롬프트 패턴

```
# 코드 리뷰
"이 PR의 변경사항을 검토하고 버그, 보안 이슈, 개선 사항을 알려줘."

# 리팩토링
"이 함수를 읽기 쉽게 리팩토링해줘. 동작은 바꾸지 말고."

# 테스트 작성
"이 함수에 대한 단위 테스트를 Jest로 작성해줘. 엣지 케이스 포함."

# 문서화
"이 모듈의 JSDoc 주석을 작성해줘."

# 디버깅
"이 에러의 원인을 찾고 수정해줘: [에러 메시지]"
```
