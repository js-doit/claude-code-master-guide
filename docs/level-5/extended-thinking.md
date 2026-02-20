---
sidebar_position: 6
title: Extended Thinking
description: Claude의 Extended Thinking 기능으로 복잡한 추론 문제를 해결하고, 사고 과정을 활용한 고품질 출력을 만드는 방법을 배웁니다.
---

# Extended Thinking

Extended Thinking은 Claude가 **응답 전에 내부적으로 깊이 생각**하도록 하는 기능입니다. 복잡한 수학 문제, 다단계 추론, 전략적 의사결정에서 훨씬 높은 정확도를 보입니다.

## Extended Thinking이란?

일반 응답 vs Extended Thinking 비교:

```
[일반 응답]
사용자 → Claude → 즉시 응답

[Extended Thinking]
사용자 → Claude → 🤔 내부 사고 과정 (thinking) → 최종 응답
```

사고 과정은 API 응답에 별도 블록으로 포함되어 디버깅에도 활용할 수 있습니다.

## 기본 사용법

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function thinkingQuery(problem: string): Promise<{
  thinking: string;
  answer: string;
}> {
  const response = await client.messages.create({
    model: "claude-opus-4-6", // Extended Thinking은 Opus 권장
    max_tokens: 16000,
    thinking: {
      type: "enabled",
      budget_tokens: 10000 // 사고에 사용할 최대 토큰
    },
    messages: [{ role: "user", content: problem }]
  });

  let thinking = "";
  let answer = "";

  for (const block of response.content) {
    if (block.type === "thinking") {
      thinking = block.thinking;
    } else if (block.type === "text") {
      answer = block.text;
    }
  }

  return { thinking, answer };
}

// 사용
const result = await thinkingQuery(
  "소수를 판별하는 가장 효율적인 알고리즘을 설계하고, " +
  "시간복잡도를 분석한 후 TypeScript로 구현해줘."
);
console.log("💭 사고 과정:\n", result.thinking);
console.log("\n✅ 최종 답변:\n", result.answer);
```

## 적합한 사용 사례

### 1. 복잡한 알고리즘 설계

```typescript
const algorithmProblem = `
  다음 조건을 만족하는 스케줄링 알고리즘을 설계해줘:
  - 100개 이상의 마이크로서비스 작업
  - 각 작업은 의존성, 우선순위, 리소스 요구사항이 있음
  - 최소한의 리소스로 최대 처리량 달성
  - 데드락 방지

  알고리즘 분석 + 의사코드 + 실제 구현 포함해줘.
`;

const { thinking, answer } = await thinkingQuery(algorithmProblem);
```

### 2. 아키텍처 의사결정

```typescript
const architectureDecision = `
  다음 조건에서 최적의 데이터베이스 아키텍처를 결정해줘:
  - 일일 활성 사용자 100만 명
  - 읽기 80% / 쓰기 20% 비율
  - 실시간 피드 기능 필요
  - 글로벌 서비스 (아시아, 유럽, 미국)
  - 99.99% 가용성 요구사항

  PostgreSQL, MongoDB, Cassandra, Redis 조합을 고려해서
  트레이드오프 분석과 최종 권고안을 제시해줘.
`;

const result = await thinkingQuery(architectureDecision);
```

### 3. 보안 취약점 분석

```typescript
const securityAnalysis = `
  다음 인증 코드에서 가능한 모든 공격 벡터를 분석해줘:

  \`\`\`typescript
  async function login(username: string, password: string) {
    const user = await db.query(
      \`SELECT * FROM users WHERE username = '\${username}'\`
    );
    if (user && user.password === md5(password)) {
      return generateToken(user.id);
    }
  }
  \`\`\`

  취약점마다 공격 시나리오와 수정 코드를 제시해줘.
`;
```

## 사고 예산(Budget) 설정

작업 복잡도에 따른 `budget_tokens` 가이드:

| 작업 유형 | 권장 budget_tokens |
|----------|-------------------|
| 단순 분석 | 1,000 ~ 3,000 |
| 중간 복잡도 | 5,000 ~ 10,000 |
| 복잡한 추론 | 15,000 ~ 30,000 |
| 매우 복잡한 문제 | 30,000 ~ 50,000 |

```typescript
// 예산 최적화 래퍼
async function adaptiveThinking(
  problem: string,
  complexity: "low" | "medium" | "high" | "extreme"
): Promise<string> {
  const budgets = {
    low: 2000,
    medium: 8000,
    high: 20000,
    extreme: 40000
  };

  const response = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: budgets[complexity] + 4096,
    thinking: {
      type: "enabled",
      budget_tokens: budgets[complexity]
    },
    messages: [{ role: "user", content: problem }]
  });

  return response.content
    .filter(b => b.type === "text")
    .map(b => b.type === "text" ? b.text : "")
    .join("");
}
```

## 사고 과정 활용하기

사고 과정을 디버깅과 품질 검증에 활용:

```typescript
async function verifiedAnalysis(code: string) {
  const { thinking, answer } = await thinkingQuery(
    `다음 코드의 버그를 찾아줘:\n\`\`\`\n${code}\n\`\`\``
  );

  // 사고 과정에서 불확실성 감지
  const isUncertain = thinking.toLowerCase().includes("잘 모르") ||
    thinking.toLowerCase().includes("확실하지") ||
    thinking.toLowerCase().includes("maybe") ||
    thinking.toLowerCase().includes("not sure");

  return {
    answer,
    confidence: isUncertain ? "low" : "high",
    reasoning: thinking.slice(0, 500) + "..." // 요약본
  };
}
```

## 멀티턴 대화에서 Thinking 활용

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function thinkingConversation() {
  const messages: Anthropic.MessageParam[] = [];

  // 1턴: 복잡한 설계 요청
  messages.push({
    role: "user",
    content: "마이크로서비스 아키텍처 설계를 도와줘. 쇼핑몰 시스템이야."
  });

  const response1 = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 12000,
    thinking: { type: "enabled", budget_tokens: 8000 },
    messages
  });

  // thinking 블록도 히스토리에 포함해야 함 (멀티턴 시)
  messages.push({ role: "assistant", content: response1.content });

  // 2턴: 후속 질문
  messages.push({
    role: "user",
    content: "결제 서비스와 주문 서비스 간 통신은 어떻게 설계할까?"
  });

  const response2 = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 12000,
    thinking: { type: "enabled", budget_tokens: 8000 },
    messages
  });

  // 두 번째 답변 텍스트 추출
  return response2.content
    .filter(b => b.type === "text")
    .map(b => b.type === "text" ? b.text : "")
    .join("");
}
```

:::tip Extended Thinking 활용 팁
- 단순한 질문에는 사용 금지 — 비용과 지연 시간이 증가함
- `budget_tokens`는 `max_tokens`보다 작아야 함
- 사고 과정을 저장해두면 나중에 결정 근거 추적 가능
- Opus 모델이 사고 품질이 가장 높음
:::

:::warning 비용 주의
Extended Thinking은 일반 응답 대비 **2~5배 토큰을 사용**합니다. 프로덕션에서는 필요한 경우에만 활성화하고, 나머지는 일반 모드로 처리하세요.
:::

---

다음 챕터: [프로덕션 배포 →](/docs/level-5/production-deployment)
