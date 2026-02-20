---
sidebar_position: 10
title: CS팀 에이전트
description: 고객 문의 처리, FAQ 생성, 에스컬레이션 판단을 수행하는 CS팀 에이전트를 구현합니다.
---

# CS팀 에이전트

CS(Customer Success)팀 에이전트는 **고객 문의 처리, FAQ 자동 생성, 고객 감정 분석, 에스컬레이션 판단**을 담당합니다. 빠르고 일관된 고객 응대로 CSAT(고객 만족도)를 높입니다.

## CS 에이전트 구현

```typescript
// src/agents/cs.ts
import { query } from "@anthropic-ai/claude-code";
import { AgentResponse } from "../shared/types";
import { extractText, log } from "../shared/utils";

const CS_SYSTEM_PROMPT = `당신은 공감 능력이 뛰어난 고객 성공 전문가입니다.
고객의 감정을 먼저 인정하고, 명확하고 실행 가능한 해결책을 제시합니다.
기술적 내용도 비전문가가 이해할 수 있게 쉽게 설명합니다.
에스컬레이션이 필요한 경우 지체 없이 적절한 팀으로 연결합니다.
응답은 항상 친절하고 전문적으로, 과도한 사과 반복은 피합니다.`;

export async function runCSAgent(task: string): Promise<AgentResponse> {
  log("CS", `작업 시작: ${task.slice(0, 40)}...`);

  // 감정 분석 먼저 실행
  const sentiment = await analyzeSentiment(task);
  const needsEscalation = sentiment === "very_negative" ||
    task.includes("환불") ||
    task.includes("법적") ||
    task.includes("언론");

  const response = await query({
    prompt: `${CS_SYSTEM_PROMPT}

    고객 감정 상태: ${sentiment}
    에스컬레이션 필요: ${needsEscalation ? "예" : "아니요"}

    ---

    ${task}`,
    options: {
      maxTurns: 8,
      allowedTools: ["Read", "Write"]
    }
  });

  const result = extractText(response);
  log("CS", `작업 완료 (에스컬레이션: ${needsEscalation})`);

  return {
    department: "cs",
    result,
    confidence: needsEscalation ? "low" : "high",
    escalationNeeded: needsEscalation,
    actionItems: needsEscalation ? ["즉시 CS 매니저에게 연결"] : []
  };
}

async function analyzeSentiment(
  text: string
): Promise<"positive" | "neutral" | "negative" | "very_negative"> {
  const response = await query({
    prompt: `다음 고객 메시지의 감정 상태를 분석해줘.
    positive/neutral/negative/very_negative 중 하나만 출력해줘.

    메시지: ${text}`,
    options: { maxTurns: 2 }
  });

  const result = extractText(response).trim().toLowerCase();

  if (result.includes("very_negative")) return "very_negative";
  if (result.includes("negative")) return "negative";
  if (result.includes("positive")) return "positive";
  return "neutral";
}
```

## 주요 CS 워크플로우

### 1. 고객 문의 자동 응답

```
고객 문의:
"안녕하세요, API 키를 발급받았는데 계속 401 에러가 나요.
 급하게 데모를 준비해야 하는데 너무 당황스럽네요."

CS 에이전트 응답:
"걱정되셨겠네요, 데모 준비 중에 이런 상황이 생겨 많이 당황스러우셨을 것 같습니다.

빠르게 해결해 드리겠습니다!

401 에러의 가장 흔한 원인들을 확인해 주세요:

1. API 키 형식 확인
   Authorization: Bearer sk-ant-xxxxx
   ← 'Bearer ' 앞에 공백이 있어야 합니다

2. 키 권한 확인
   대시보드 > API Keys > 해당 키의 권한이 '활성'인지 확인

3. 환경 변수 확인
   .env 파일과 실제 코드에서 같은 키를 쓰고 있는지 확인

위 방법으로도 해결이 안 되시면 키를 새로 발급받아 시도해 보세요.
데모 시간이 언제인가요? 그 전까지 해결될 수 있도록 도와드리겠습니다."
```

### 2. FAQ 자동 생성

```typescript
async function generateFAQ(
  ticketHistory: string[],
  topN: number = 20
) {
  return runCSAgent(
    `다음 고객 지원 티켓 히스토리에서 자주 묻는 질문 ${topN}개를 추출하고
    FAQ 문서를 작성해줘.

    티켓 히스토리:
    ${ticketHistory.join("\n\n")}

    FAQ 형식:
    ## [카테고리]
    **Q: 질문**
    A: 답변 (단계별 해결법 포함)

    카테고리: 설치/설정, API 연동, 결제/구독, 데이터/보안, 기타`
  );
}
```

### 3. 고객 VOC 분석

```typescript
async function analyzeVOC(
  feedbacks: string[],
  period: string
) {
  return runCSAgent(
    `${period} 기간의 고객 피드백을 분석하고 인사이트를 도출해줘.

    피드백 데이터:
    ${feedbacks.join("\n")}

    분석 항목:
    1. 긍정 피드백 주요 테마 (유지해야 할 강점)
    2. 부정 피드백 주요 이슈 (개선 우선순위)
    3. 기능 요청 빈도 Top 5
    4. 이탈 위험 신호 패턴
    5. 즉시 개선 가능한 UX 이슈 3가지
    6. 제품팀에 전달할 핵심 인사이트`
  );
}
```

### 4. 에스컬레이션 판단 로직

```typescript
interface EscalationRule {
  condition: (text: string) => boolean;
  target: string;
  priority: "urgent" | "high" | "normal";
}

const ESCALATION_RULES: EscalationRule[] = [
  {
    condition: (t) => t.includes("환불") || t.includes("취소"),
    target: "CS 매니저",
    priority: "high"
  },
  {
    condition: (t) => t.includes("법적") || t.includes("소송") || t.includes("변호사"),
    target: "법무팀",
    priority: "urgent"
  },
  {
    condition: (t) => t.includes("데이터 유출") || t.includes("개인정보"),
    target: "보안팀 + 법무팀",
    priority: "urgent"
  },
  {
    condition: (t) => t.includes("언론") || t.includes("기사"),
    target: "PR팀 + 임원",
    priority: "urgent"
  }
];

function checkEscalation(text: string) {
  for (const rule of ESCALATION_RULES) {
    if (rule.condition(text)) {
      return { shouldEscalate: true, ...rule };
    }
  }
  return { shouldEscalate: false };
}
```

## CSAT 모니터링 자동화

```typescript
// 매일 CSAT 현황을 분석하고 이상 징후 감지
async function dailyCSATMonitor(csatData: string) {
  const analysis = await runCSAgent(
    `오늘의 CSAT 데이터를 분석해줘.

    CSAT 데이터:
    ${csatData}

    분석:
    - 오늘 평균 CSAT 점수 vs 지난 7일 평균
    - 낮은 점수(3점 이하) 티켓 공통 패턴
    - 특정 담당자나 이슈 유형에서 반복 문제
    - 즉시 Follow-up이 필요한 고객 목록`
  );

  // CSAT 3.0 이하로 떨어지면 CS 팀장에게 알림
  if (analysis.result.includes("3.0 이하") ||
      analysis.result.includes("급감")) {
    await alertCSManager(analysis.result);
  }

  return analysis;
}
```

:::tip CS 에이전트 활용 팁
- 제품 문서, 릴리즈 노트를 시스템 프롬프트에 포함해 정확한 답변 보장
- 부정 감정 감지 시 더 공감적인 톤으로 응답하도록 프롬프트 조정
- 반복되는 문의는 자동으로 FAQ에 추가하는 루프 구성
:::

---

다음 챕터: [업종별 템플릿 →](/docs/capstone/templates)
