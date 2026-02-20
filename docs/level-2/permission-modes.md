---
sidebar_position: 3
title: 권한 모드
description: Claude Code의 세 가지 권한 모드(기본/자동승인/헤드리스)를 이해하고 상황에 맞게 선택하는 방법을 배웁니다.
---

# 권한 모드

Claude Code는 파일 수정, 명령어 실행 등 실제 시스템에 영향을 주는 작업을 합니다. 이런 작업을 얼마나 자유롭게 허용할지 결정하는 것이 **권한 모드**입니다.

## 세 가지 권한 모드

| 모드 | 명령어 | 특징 |
|------|--------|------|
| 기본 (Default) | `claude` | 작업마다 승인 요청 |
| 자동 승인 | `claude --dangerously-skip-permissions` | 모든 작업 자동 승인 |
| 헤드리스 | `claude -p "..."` | 비대화형, CI/CD용 |

## 기본 모드: 가장 안전한 선택

Claude Code를 그냥 `claude`로 실행하면 기본 모드입니다.

```bash
claude
```

기본 모드에서 Claude Code는 다음 작업을 실행하기 전에 반드시 허락을 구합니다:

- **파일 쓰기/수정**: "이 파일을 수정해도 될까요?"
- **쉘 명령어 실행**: "npm install을 실행해도 될까요?"
- **파일 삭제**: "이 파일을 삭제해도 될까요?"

```
Claude: auth/login.ts를 생성하겠습니다. 허용하시겠습니까?
[y] Yes  [n] No  [a] Always allow this type  [d] Don't allow
```

### 승인 옵션 이해하기

| 선택 | 의미 |
|------|------|
| `y` (Yes) | 이번 한 번만 허용 |
| `n` (No) | 거절, Claude가 다른 방법 시도 |
| `a` (Always) | 이 세션에서 같은 종류 작업 자동 허용 |
| `d` (Don't allow) | 이 세션에서 이 종류 작업 항상 거절 |

:::tip 실무 팁
처음 세션을 시작할 때 몇 번의 승인 후 `a`를 눌러 패턴을 허용해두면 편합니다. "파일 쓰기"를 `a`로 허용하면 이후에는 매번 묻지 않습니다.
:::

## 자동 승인 모드: 빠르지만 주의 필요

```bash
claude --dangerously-skip-permissions
```

모든 승인을 건너뛰고 작업을 즉시 실행합니다. 이름에 `dangerously`가 붙은 이유가 있습니다.

### 언제 쓰나?

- **신뢰할 수 있는 작업을 대량으로 처리**할 때
- **로컬 개발 환경**에서 빠르게 반복 작업할 때
- **Docker 컨테이너 같은 격리된 환경**에서 테스트할 때

### 언제 쓰면 안 되나?

- 프로덕션 환경
- 중요한 파일이 있는 실제 프로젝트 (실수로 삭제될 수 있음)
- 처음 써보는 기능이나 낯선 코드베이스

:::warning 주의
자동 승인 모드에서는 Claude Code가 파일을 삭제하거나, 원하지 않는 패키지를 설치하거나, 예상치 못한 변경을 할 수 있습니다. 작업 범위를 명확히 지정하고 git 커밋 후 시작하세요.
:::

## 헤드리스 모드: CI/CD와 자동화

헤드리스 모드는 사람의 입력 없이 Claude Code를 실행합니다. 주로 GitHub Actions, Jenkins 같은 CI/CD 파이프라인에서 씁니다.

```bash
# 기본 파이프 모드
claude -p "이 함수에 단위 테스트 작성해줘"

# 파일 내용을 파이프로 전달
cat src/utils.ts | claude -p "이 파일의 버그를 찾아줘"

# 결과를 파일로 저장
claude -p "README.md 초안 작성해줘" > README.md
```

### CI/CD 파이프라인 예시

```yaml
# GitHub Actions
- name: AI Code Review
  run: |
    claude -p "변경된 파일에서 보안 취약점 검사해줘" \
      --output-format json > review.json
```

### 헤드리스 모드 특징

- 대화형 UI 없음
- 표준 입출력(stdin/stdout) 사용
- `--output-format json`으로 구조화된 출력 가능
- 자동화이므로 항상 권한 승인 없이 실행됨

## 권한 모드 선택 가이드

```
지금 뭘 하려고?
│
├─ 새 코드베이스 탐색/이해
│   → 기본 모드 (읽기 작업 위주라 안전)
│
├─ 혼자 로컬에서 빠르게 개발
│   → 자동 승인 모드 (단, git 커밋 먼저)
│
├─ 팀 프로젝트, 중요한 코드
│   → 기본 모드 (팀원이 나중에 볼 코드)
│
└─ CI/CD, 자동화 스크립트
    → 헤드리스 모드
```

## 실수 대비: git 먼저, 그 다음 자동 승인

자동 승인 모드를 쓸 때는 항상 먼저 git commit을 해두세요. Claude Code가 실수로 파일을 망쳐도 `git checkout .`으로 즉시 복구할 수 있습니다.

```bash
git add . && git commit -m "chore: AI 작업 전 스냅샷"
claude --dangerously-skip-permissions
```

이 습관 하나가 수많은 실수를 막아줍니다.

---

다음 챕터: [Git 연동 →](/docs/level-2/git-integration)
