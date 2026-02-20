---
sidebar_position: 2
title: Hooks 시스템
description: Claude Code의 Hooks 시스템으로 도구 실행 전후에 자동화된 워크플로우를 구축하는 방법을 배웁니다.
---

# Hooks 시스템

Hooks는 Claude Code가 특정 동작을 수행하기 **전후에 쉘 명령어를 자동으로 실행**할 수 있게 해주는 시스템입니다. 테스트 자동 실행, 포맷팅, 알림, 로깅 등 반복 작업을 코딩 워크플로우에 내장할 수 있습니다.

## Hooks란 무엇인가

Claude Code가 파일을 수정하거나 명령을 실행할 때, 그 동작에 "끼어들어" 추가 작업을 수행할 수 있습니다.

```
Claude가 파일 수정 요청 받음
        ↓
[PreToolUse Hook 실행] ← 수정 전에 실행할 명령
        ↓
Claude가 파일 수정
        ↓
[PostToolUse Hook 실행] ← 수정 후에 실행할 명령
        ↓
다음 작업 진행
```

이를 통해 "파일 수정 후 자동으로 린터 실행", "Bash 명령 실행 전 로그 기록" 같은 자동화가 가능합니다.

## Hook 종류

| Hook 이벤트 | 실행 시점 |
|------------|---------|
| `PreToolUse` | 도구 실행 직전 |
| `PostToolUse` | 도구 실행 직후 |
| `Notification` | Claude가 알림을 보낼 때 |
| `Stop` | Claude가 응답을 완료했을 때 |

## 설정 방법

Hooks는 `settings.json`에서 설정합니다.

**전역 설정** (`~/.claude/settings.json`):
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npm run lint --silent"
          }
        ]
      }
    ]
  }
}
```

**프로젝트별 설정** (`.claude/settings.json`):
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npm run format"
          }
        ]
      }
    ]
  }
}
```

프로젝트 설정이 전역 설정보다 우선합니다.

## matcher 패턴

`matcher`는 어떤 도구에 Hook을 적용할지 정규식으로 지정합니다:

```json
"matcher": "Write"          // Write 도구만
"matcher": "Edit"           // Edit 도구만
"matcher": "Write|Edit"     // Write 또는 Edit
"matcher": "Bash"           // Bash 도구만
"matcher": ".*"             // 모든 도구
```

도구 이름 목록: `Write`, `Edit`, `Bash`, `Read`, `Glob`, `Grep`, `Task`

## 실전 예제

### 파일 저장 시 자동 포맷팅

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

`$CLAUDE_TOOL_INPUT_FILE_PATH`는 방금 수정된 파일 경로를 담은 환경변수입니다.

### 파일 저장 시 린트 및 타입 체크

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx tsc --noEmit 2>&1 | head -20"
          }
        ]
      }
    ]
  }
}
```

### Bash 명령 실행 전 로그 기록

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[$(date)] CMD: $CLAUDE_TOOL_INPUT_COMMAND\" >> ~/claude-audit.log"
          }
        ]
      }
    ]
  }
}
```

### 작업 완료 시 데스크톱 알림 (macOS)

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "osascript -e 'display notification \"Claude 작업 완료\" with title \"Claude Code\"'"
          }
        ]
      }
    ]
  }
}
```

### 작업 완료 시 데스크톱 알림 (Windows)

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -Command \"[System.Windows.Forms.MessageBox]::Show('Claude 작업 완료')\""
          }
        ]
      }
    ]
  }
}
```

## Hook 환경변수

Hook 명령어에서 사용할 수 있는 환경변수:

| 변수명 | 설명 |
|--------|------|
| `$CLAUDE_TOOL_NAME` | 실행된 도구 이름 |
| `$CLAUDE_TOOL_INPUT_FILE_PATH` | 수정된 파일 경로 |
| `$CLAUDE_TOOL_INPUT_COMMAND` | 실행된 Bash 명령어 |

## Hook 출력 처리

Hook 명령의 출력은 Claude에게 전달됩니다. 이를 활용하면 Hook이 추가 정보를 제공할 수 있습니다:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npm test -- --passWithNoTests 2>&1 | tail -5"
          }
        ]
      }
    ]
  }
}
```

테스트가 실패하면 Claude가 그 결과를 보고 자동으로 수정을 시도합니다.

## 주의사항

:::warning Hook 보안
Hook은 Claude가 실행하는 코드와 동일한 권한으로 실행됩니다. 외부에서 받은 `settings.json`에 악성 Hook이 포함될 수 있으므로, 신뢰할 수 없는 프로젝트의 `.claude/settings.json`을 그대로 적용하지 마세요.
:::

:::tip Hook 성능
Hook 명령이 오래 걸리면 Claude Code의 응답이 느려집니다. 린터나 테스트는 빠르게 실행되도록 옵션을 조정하세요 (예: `--passWithNoTests`, `--silent`).
:::

## 권장 Hook 구성

실무에서 가장 유용한 Hook 조합:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null; npx eslint \"$CLAUDE_TOOL_INPUT_FILE_PATH\" --fix --quiet 2>&1 | head -10"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[$(date '+%H:%M:%S')] 작업 완료\" >> ~/.claude-sessions.log"
          }
        ]
      }
    ]
  }
}
```

---

다음 챕터: [MCP 서버 연결 →](/docs/level-3/mcp-servers)
