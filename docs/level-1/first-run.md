---
sidebar_position: 6
title: 첫 번째 실행
description: Claude Code를 처음 실행하고, 실제 프로젝트에 적용하는 첫 번째 AI 코딩 세션을 안내합니다.
---

# 첫 번째 실행

> 💡 **이 챕터에서 배우는 것**: Claude Code 인터페이스 이해, 첫 대화 시작, 권한 모드 선택

:::info 전제 지식
[API 키 설정](/docs/level-1/api-key-setup)이 완료되어 있어야 합니다.
:::

---

## 실습 준비: 테스트 폴더 만들기

```bash
mkdir claude-test
cd claude-test
```

빈 폴더에서 시작하거나, 기존 프로젝트 폴더로 이동해도 됩니다.

---

## Claude Code 시작하기

```bash
claude
```

처음 실행하면 다음과 같은 화면이 나타납니다:

```
╭─────────────────────────────────────────────────────────╮
│ ✻ Welcome to Claude Code!                               │
│                                                         │
│   /help for help, /status for your current setup        │
╰─────────────────────────────────────────────────────────╯

 What would you like to do?
>
```

`>` 프롬프트가 나타나면 자연어로 명령을 입력할 수 있습니다.

---

## 인터페이스 구성 이해하기

Claude Code 화면의 주요 요소:

```
╭─────────────────────────────────────────────────────────╮
│  모델 정보: claude-sonnet-4-6               토큰: 1,234  │
│  현재 디렉토리: /Users/you/claude-test                  │
╰─────────────────────────────────────────────────────────╯

 Claude의 응답이 여기 표시됩니다.

 What would you like to do?
> 여기에 명령을 입력합니다
```

- **상단**: 현재 모델, 사용 토큰 정보
- **중간**: Claude의 응답
- **하단**: 입력 프롬프트

---

## 첫 번째 실습: "Hello, Claude!"

가장 간단한 시작:

```
> 안녕! 나는 지금 Claude Code를 처음 써보고 있어. 이 도구로 뭘 할 수 있는지 간단히 알려줘.
```

Claude가 자신의 능력을 요약해서 설명해줄 것입니다.

---

## 두 번째 실습: 파일 만들기

실제 파일을 만들어봅시다:

```
> hello.py 파일을 만들어줘. "Hello, Claude Code!" 를 출력하는 파이썬 코드로.
```

Claude가 파일을 생성하려 할 때 **권한 확인** 화면이 나타납니다:

```
Claude wants to create a file: hello.py

Content:
  print("Hello, Claude Code!")

Allow? [y/n/always/never]
```

- `y` — 이번 한 번만 허용
- `n` — 거부
- `always` — 항상 허용 (세션 동안)
- `never` — 항상 거부

`y`를 입력하고 Enter.

파일이 생성되면 바로 실행해보세요:

```
> python hello.py 를 실행해줘
```

---

## 권한 모드 이해하기

Claude Code는 세 가지 권한 모드가 있습니다:

### 1. 기본 모드 (Default)
모든 파일 쓰기, 명령 실행 전에 확인을 요청합니다. **처음 사용할 때 권장.**

### 2. Auto-approve 모드
`claude --dangerously-skip-permissions` 또는 세션 중 `Shift+Tab` 토글

:::caution 주의
Auto-approve 모드는 모든 작업을 자동 실행합니다. 신뢰할 수 있는 작업에만 사용하세요.
:::

### 3. Headless 모드
```bash
claude -p "명령어" --output-format json
```
CI/CD 파이프라인 등 자동화에 사용합니다.

---

## 세 번째 실습: 코드 수정

이번엔 기존 코드를 수정해봅시다:

```
> hello.py를 수정해서, 사용자 이름을 입력받고 "Hello, {이름}!" 으로 출력하게 해줘
```

Claude가 현재 파일을 읽고, 수정안을 보여준 뒤 변경을 요청합니다.

---

## 유용한 키보드 단축키

| 단축키 | 기능 |
|--------|------|
| `Ctrl+C` | 현재 응답 중단 |
| `↑` / `↓` | 이전/다음 명령 히스토리 |
| `Ctrl+L` | 화면 지우기 |
| `Shift+Tab` | 자동 승인 모드 토글 |
| `Ctrl+R` | 대화 초기화 (새 컨텍스트) |

---

## 슬래시 커맨드

`/`로 시작하는 특별 명령어:

```
/help       — 도움말
/status     — 현재 설정 및 모델 정보
/clear      — 대화 내용 지우기
/exit       — 종료
/model      — 모델 변경
/cost       — 이번 세션 사용 비용 확인
```

---

## 첫 번째 세션 마무리

```
> /cost
```

이번 세션에서 사용한 비용을 확인하세요. 일반적인 첫 세션은 $0.01 미만입니다.

```
> /exit
```

또는 `Ctrl+D`로 종료합니다.

---

## 핵심 정리

- `claude` 명령으로 시작, 자연어로 작업 지시
- 파일 수정/생성/실행 전에 권한 확인 요청
- `y` (허용), `n` (거부), `always` (항상 허용)
- `/help`, `/status`, `/cost` 등 슬래시 커맨드 활용

---

## 다음 단계

→ [기본 명령어](/docs/level-1/basic-commands) — Claude Code의 핵심 명령어와 활용 패턴을 배워봅시다
