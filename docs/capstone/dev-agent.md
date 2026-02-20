---
sidebar_position: 6
title: 개발팀 에이전트
description: 코드 리뷰, 기술 부채 분석, PR 검토, 보안 감사를 수행하는 개발팀 에이전트를 구현합니다.
---

# 개발팀 에이전트

개발팀 에이전트는 **코드 품질, 아키텍처 리뷰, 보안 감사, 기술 부채 관리**를 담당합니다. 실제 코드에 접근해 구체적이고 실행 가능한 피드백을 제공합니다.

## 개발 에이전트 구현

```typescript
// src/agents/dev.ts
import { query } from "@anthropic-ai/claude-code";
import { AgentResponse } from "../shared/types";
import { extractText, log } from "../shared/utils";

const DEV_SYSTEM_PROMPT = `당신은 15년 경력의 시니어 소프트웨어 아키텍트입니다.
코드 품질, 보안, 성능, 확장성을 균형 있게 평가합니다.
문제를 발견할 때는 반드시 구체적인 해결책도 함께 제시합니다.
OWASP Top 10, SOLID 원칙, 클린 코드 가이드라인을 기준으로 판단합니다.`;

export async function runDevAgent(task: string): Promise<AgentResponse> {
  log("DEV", `작업 시작: ${task.slice(0, 40)}...`);

  const response = await query({
    prompt: `${DEV_SYSTEM_PROMPT}\n\n---\n\n${task}`,
    options: {
      maxTurns: 15,
      allowedTools: ["Read", "Glob", "Grep", "Bash"]
    }
  });

  const result = extractText(response);
  const hasCritical = result.includes("치명적") ||
    result.includes("critical") ||
    result.includes("보안 취약점");

  log("DEV", `작업 완료 (치명적 이슈: ${hasCritical ? "있음" : "없음"})`);

  return {
    department: "dev",
    result,
    confidence: "high",
    escalationNeeded: hasCritical,
    actionItems: extractCodeActionItems(result)
  };
}

function extractCodeActionItems(text: string): string[] {
  const items: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    if (line.match(/^(TODO|FIX|CRITICAL|보안|수정 필요):/i)) {
      items.push(line.trim());
    }
  }

  return items.slice(0, 10);
}
```

## 주요 개발 워크플로우

### 1. PR 자동 코드 리뷰

```
> 개발팀: src/api/auth/ 폴더의 최근 변경사항을 리뷰해줘.
  집중 검토: 보안 이슈, API 설계 일관성
```

에이전트 응답 예시:
```
## PR 코드 리뷰 결과

### 🔴 치명적 (즉시 수정 필요)
1. src/api/auth/login.ts:47
   SQL 쿼리에 사용자 입력 직접 삽입 → SQL 인젝션 위험
   수정: parameterized query 사용

### 🟡 주요 (다음 스프린트 내 수정)
2. src/api/auth/jwt.ts:23
   JWT 시크릿이 하드코딩됨 → 환경 변수로 이동

### 🟢 개선 제안
3. src/api/auth/middleware.ts
   인증 미들웨어 중복 코드 → 공통 함수로 추출 가능
```

### 2. 기술 부채 분석

```typescript
async function analyzeTechDebt(rootDir: string) {
  return runDevAgent(
    `${rootDir} 코드베이스의 기술 부채를 분석해줘.

    분석 항목:
    1. TODO/FIXME/HACK 주석 수집 및 우선순위 분류
    2. 순환 복잡도가 높은 함수 (>10) 식별
    3. 테스트 커버리지 부족 모듈
    4. deprecated 패키지 의존성
    5. 중복 코드 패턴

    결과: 심각도별 분류 + 예상 수정 공수(SP)`
  );
}
```

### 3. 보안 감사

```typescript
async function securityAudit(targetDir: string) {
  return runDevAgent(
    `${targetDir}의 보안 취약점을 OWASP Top 10 기준으로 감사해줘.

    검토 항목:
    - A01: 접근 제어 취약점
    - A02: 암호화 실패
    - A03: 인젝션 (SQL, XSS, XXE)
    - A04: 안전하지 않은 설계
    - A05: 보안 설정 오류
    - A06: 취약하거나 오래된 구성 요소

    각 취약점: 위치, 심각도, 공격 시나리오, 수정 코드 포함`
  );
}
```

### 4. 아키텍처 리뷰

```typescript
async function architectureReview(requirement: string) {
  return runDevAgent(
    `다음 요구사항에 맞는 시스템 아키텍처를 검토하고 개선안을 제시해줘.

    요구사항:
    ${requirement}

    현재 아키텍처 분석:
    - 현재 구조의 강점과 약점
    - 스케일링 병목 지점
    - 단일 장애 지점 (SPOF)
    - 마이크로서비스 분리 기회

    개선 권고안:
    - 단기 (1개월): 즉시 적용 가능한 변경
    - 중기 (3개월): 점진적 리팩토링
    - 장기 (6개월): 아키텍처 전환 로드맵`
  );
}
```

## 개발 에이전트 자동화 파이프라인

PR이 열릴 때마다 자동으로 코드 리뷰를 실행하는 GitHub Actions:

```yaml
# .github/workflows/ai-code-review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Get changed files
        id: changed
        run: |
          git diff --name-only origin/main...HEAD > changed_files.txt
          echo "files=$(cat changed_files.txt | tr '\n' ',')" >> $GITHUB_OUTPUT

      - name: Run AI Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          node scripts/ai-review.js "${{ steps.changed.outputs.files }}"

      - name: Post Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const review = fs.readFileSync('review-result.md', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: review
            });
```

:::tip 개발 에이전트 효과 극대화
- 코드 리뷰 전에 `Glob`으로 변경된 파일만 특정해서 전달
- 보안 감사는 격주 정기 실행으로 자동화
- 치명적 이슈 발견 시 Slack/이메일 알림 연동
:::

---

다음 챕터: [재무팀 에이전트 →](/docs/capstone/finance-agent)
