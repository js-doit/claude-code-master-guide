---
sidebar_position: 2
title: 자주 묻는 질문
description: Claude Code 설치, API 키, 비용, 오류 해결 등 자주 묻는 질문에 답합니다
---

# ❓ 자주 묻는 질문

---

## 설치 및 시작

### Q. Claude Code를 설치했는데 `claude` 명령어를 찾을 수 없다고 나옵니다.

npm 글로벌 설치 경로가 PATH에 없는 경우입니다.

```bash
# 글로벌 경로 확인
npm config get prefix

# ~/.bashrc 또는 ~/.zshrc에 추가
export PATH="$PATH:$(npm config get prefix)/bin"

# 적용
source ~/.bashrc
```

### Q. Node.js 버전이 맞지 않는다는 오류가 납니다.

Claude Code는 Node.js 18 이상을 요구합니다.

```bash
node --version  # 현재 버전 확인

# nvm으로 업그레이드
nvm install 20
nvm use 20
```

### Q. macOS에서 권한 오류가 납니다.

`sudo` 없이 설치하려면 npm 글로벌 디렉토리 소유권을 수정하세요.

```bash
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
npm install -g @anthropic-ai/claude-code
```

---

## API 키

### Q. API 키는 어디서 발급받나요?

[console.anthropic.com](https://console.anthropic.com) → API Keys 메뉴에서 발급받습니다. 계정 가입 후 결제 수단 등록이 필요합니다.

### Q. API 키를 설정했는데 계속 인증 오류(401)가 납니다.

1. 키 앞뒤 공백 여부 확인
2. `ANTHROPIC_API_KEY` 환경 변수명 오타 확인
3. 키 권한이 "활성" 상태인지 대시보드에서 확인
4. 그래도 안 되면 키를 새로 발급 후 시도

### Q. 팀원과 API 키를 공유해도 되나요?

보안상 권장하지 않습니다. 각자 개인 키를 발급하거나, 조직용 API 키를 용도별로 분리해서 사용하세요. 키 유출 시 즉시 비활성화하고 재발급받으세요.

---

## 비용 및 요금

### Q. Claude Code 사용료는 얼마인가요?

Claude Code 자체는 무료이지만, Anthropic API 사용량에 따라 비용이 발생합니다. 현재 요금은 [Anthropic 가격 페이지](https://www.anthropic.com/pricing)에서 확인하세요.

### Q. 한 달에 얼마나 쓸지 모르겠어요. 한도 설정이 가능한가요?

Anthropic 콘솔에서 월 지출 한도(Usage Limit)를 설정할 수 있습니다. `console.anthropic.com` → Settings → Limits에서 설정하세요.

### Q. 세션 중 현재까지 쓴 비용을 확인할 수 있나요?

Claude Code 대화 중 `/cost` 커맨드를 입력하면 현재 세션의 누적 토큰 사용량과 예상 비용을 확인할 수 있습니다.

---

## 사용 중 오류

### Q. "Context window exceeded" 오류가 납니다.

컨텍스트(대화 내용)가 모델의 최대 길이를 초과했습니다.

- `/compact` 커맨드로 대화를 요약하거나
- `/clear`로 새로 시작하세요
- CLAUDE.md에 핵심 정보를 저장해두면 새 세션에서도 컨텍스트를 유지할 수 있습니다

### Q. Claude가 같은 실수를 반복합니다.

CLAUDE.md에 "하지 말 것" 규칙을 명시하세요.

```markdown
## 주의사항
- `package-lock.json`은 절대 수동으로 수정하지 말 것
- 테스트 파일을 삭제하지 말 것
- `console.log` 디버그 코드를 커밋에 포함하지 말 것
```

### Q. 파일을 수정하고 나서 되돌리고 싶습니다.

Claude Code가 수정한 파일은 git으로 추적됩니다.

```bash
git diff          # 변경 내용 확인
git restore .     # 전체 되돌리기
git restore 파일명  # 특정 파일만 되돌리기
```

### Q. Claude가 응답을 중간에 멈춥니다.

- 네트워크 불안정 시 발생할 수 있습니다
- `--no-stream` 옵션으로 스트리밍을 끄고 시도해보세요
- 응답이 너무 길 경우 작업을 더 작게 나눠서 요청하세요

---

## IDE 연동

### Q. VS Code에서 Claude Code 확장이 보이지 않습니다.

VS Code Extensions 마켓플레이스에서 "Claude Code"로 검색하거나, 터미널에서 `claude` 실행 후 IDE 연동 옵션을 선택하세요.

### Q. JetBrains IDE(IntelliJ, PyCharm 등)에서도 사용 가능한가요?

JetBrains 플러그인 마켓플레이스에서 Claude Code 플러그인을 설치하면 됩니다. 동일한 API 키로 연동됩니다.

---

## Agent SDK

### Q. Agent SDK는 어디서 설치하나요?

```bash
npm install @anthropic-ai/claude-code
```

Claude Code CLI와 같은 패키지입니다. `query()` 함수를 import해서 사용합니다.

### Q. `query()` 호출 시 Claude Code가 실행되어 있어야 하나요?

아닙니다. Agent SDK는 Anthropic API를 직접 호출합니다. 단, `ANTHROPIC_API_KEY` 환경 변수가 설정되어 있어야 합니다.

### Q. 멀티에이전트 실행 시 API 키 하나로 여러 에이전트를 동시에 쓸 수 있나요?

네, 가능합니다. 다만 동시 요청 수에 따라 Rate Limit에 걸릴 수 있으니 에이전트 수가 많은 경우 큐잉(queuing)을 적용하세요.

---

## 기타

### Q. Claude Code가 생성한 코드의 저작권은 누구에게 있나요?

Anthropic 이용약관에 따르면 사용자가 생성한 출력물의 소유권은 사용자에게 있습니다. 다만 라이선스 관련 사항은 항상 법무 전문가와 확인하세요.

### Q. 오프라인 환경에서도 사용 가능한가요?

Claude Code는 Anthropic API에 인터넷 연결이 필요합니다. 완전 오프라인 환경에서는 사용할 수 없습니다.

### Q. 한국어로 물어보면 한국어로 답해주나요?

네, Claude는 한국어를 완벽하게 지원합니다. 한국어로 질문하면 한국어로 답변하며, CLAUDE.md에 `Primary Language: 한국어`를 명시하면 더 일관되게 한국어로 응답합니다.
