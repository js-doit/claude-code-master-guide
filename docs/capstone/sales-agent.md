---
sidebar_position: 8
title: 영업팀 에이전트
description: 제안서 작성, 파이프라인 분석, CRM 업데이트를 지원하는 영업팀 에이전트를 구현합니다.
---

# 영업팀 에이전트

영업팀 에이전트는 **제안서 작성, 영업 파이프라인 분석, CRM 업데이트, 고객 리서치**를 담당합니다. 영업 담당자가 고객과의 대화에 집중할 수 있도록 행정 업무를 자동화합니다.

## 영업 에이전트 구현

```typescript
// src/agents/sales.ts
import { query } from "@anthropic-ai/claude-code";
import { AgentResponse } from "../shared/types";
import { extractText, log } from "../shared/utils";

const SALES_SYSTEM_PROMPT = `당신은 B2B SaaS 영업 전략가입니다.
고객의 비즈니스 문제를 이해하고 솔루션 가치를 명확하게 전달합니다.
데이터 기반으로 영업 파이프라인을 관리하고 승률을 높입니다.
고객 중심 사고로 장기적 파트너십을 구축하는 것이 목표입니다.`;

export async function runSalesAgent(task: string): Promise<AgentResponse> {
  log("SALES", `작업 시작: ${task.slice(0, 40)}...`);

  const response = await query({
    prompt: `${SALES_SYSTEM_PROMPT}\n\n---\n\n${task}`,
    options: {
      maxTurns: 10,
      allowedTools: ["Read", "Write"]
    }
  });

  const result = extractText(response);
  log("SALES", "작업 완료");

  return {
    department: "sales",
    result,
    confidence: "high",
    actionItems: []
  };
}

## 주요 영업 워크플로우

### 1. 맞춤형 제안서 작성

```
> 영업팀: 삼성SDS에 제출할 AI 개발 도구 제안서를 작성해줘.
  담당자: 이정호 부장 / IT 인프라팀
  핵심 페인포인트: 개발자 생산성 저하, 코드 품질 관리 어려움
  예산: 연 5억원 규모 / 결정권자: CTO
```

에이전트 응답:
```
## 삼성SDS 맞춤 AI 개발 도구 도입 제안서

### Executive Summary
삼성SDS의 1,200명 개발자 생산성을 평균 35% 향상시키고
코드 품질 이슈를 70% 감소시킬 수 있는 AI 개발 플랫폼을 제안합니다.

### 현재 과제 분석
- 코드 리뷰에 소요되는 시간: 개발자당 주 8시간
- 프로덕션 버그의 60%가 코드 리뷰 단계에서 놓침
- 신규 개발자 온보딩 기간: 평균 3개월

### 솔루션 제안
...

### ROI 분석
- 연간 절감 효과: 약 12억원
- 투자 회수 기간: 5개월
- 3년 누적 ROI: 520%
```

### 2. 파이프라인 분석 및 예측

```typescript
async function analyzePipeline(pipelineData: string) {
  return runSalesAgent(
    `현재 영업 파이프라인을 분석하고 분기 목표 달성 가능성을 예측해줘.

    파이프라인 데이터:
    ${pipelineData}

    분석 요청:
    1. 단계별 딜 현황 및 전환율
    2. 이번 분기 예상 클로징 딜
    3. 위험 딜 식별 (30일 이상 진전 없음)
    4. 목표 대비 갭 및 커버리지 전략
    5. 각 담당자별 지원이 필요한 딜`
  );
}
```

### 3. 고객 리서치 브리핑

```typescript
async function customerResearch(
  companyName: string,
  meetingPurpose: string
) {
  return runSalesAgent(
    `${companyName}와의 미팅 전 리서치 브리핑을 준비해줘.

    미팅 목적: ${meetingPurpose}

    브리핑 내용:
    1. 회사 개요 (업종, 규모, 최근 동향)
    2. 기술 스택 및 디지털 전환 현황
    3. 최근 이슈 및 공개된 과제
    4. 예상 구매 결정자와 영향자 맵
    5. 우리 솔루션과의 연결 포인트 3가지
    6. 미팅에서 할 추천 질문 5개`
  );
}
```

### 4. 이메일 시퀀스 작성

```typescript
async function createEmailSequence(
  prospect: string,
  painPoint: string,
  sequenceLength: number
) {
  return runSalesAgent(
    `${prospect} 타겟의 ${sequenceLength}단계 이메일 시퀀스를 작성해줘.

    핵심 페인포인트: ${painPoint}

    각 이메일:
    - 발송 타이밍 (예: 첫 접촉 후 3일)
    - 제목 (A/B 테스트용 2개)
    - 본문 (200자 이내)
    - CTA (명확하고 낮은 부담)

    톤: 전문적이되 따뜻하게, 팔려는 느낌보다 도움이 되려는 느낌`
  );
}
```

## 영업 에이전트 + CRM 연동

```typescript
import { runSalesAgent } from "./sales";

// CRM에서 데이터 가져와서 에이전트 실행 후 업데이트
async function syncWithCRM(dealId: string) {
  // 1. CRM에서 딜 정보 가져오기
  const deal = await crmApi.getDeal(dealId);

  // 2. 에이전트로 분석
  const analysis = await runSalesAgent(
    `다음 딜의 현재 상태를 분석하고 다음 액션을 추천해줘:
    딜명: ${deal.name}
    단계: ${deal.stage}
    마지막 활동: ${deal.lastActivity}
    고객 반응: ${deal.notes}`
  );

  // 3. CRM 업데이트
  await crmApi.updateDeal(dealId, {
    aiAnalysis: analysis.result,
    nextAction: analysis.actionItems[0],
    updatedAt: new Date()
  });
}
```

:::tip 영업 에이전트 효과 극대화
- 제안서 작성 시 고객사의 공개 재무제표/공시 자료를 context로 제공
- 성공한 딜의 제안서를 Few-shot 예시로 포함
- 파이프라인 분석은 매주 월요일 자동 실행으로 주간 회의 준비
:::

---

다음 챕터: [법무팀 에이전트 →](/docs/capstone/legal-agent)
