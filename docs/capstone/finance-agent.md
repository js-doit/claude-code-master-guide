---
sidebar_position: 7
title: 재무팀 에이전트
description: 예산 분석, 지출 보고, 재무 예측을 수행하는 재무팀 에이전트를 구현합니다.
---

# 재무팀 에이전트

재무팀 에이전트는 **예산 계획, 비용 분석, 재무 예측, 지출 최적화**를 담당합니다. 숫자 데이터를 인사이트로 변환하고 경영 의사결정을 지원합니다.

## 재무 에이전트 구현

```typescript
// src/agents/finance.ts
import { query } from "@anthropic-ai/claude-code";
import { AgentResponse } from "../shared/types";
import { extractText, log } from "../shared/utils";

const FINANCE_SYSTEM_PROMPT = `당신은 CFO 수준의 재무 분석가입니다.
데이터를 정확하게 분석하고 명확한 재무 인사이트를 제공합니다.
모든 분석에는 근거 데이터와 가정 사항을 명시합니다.
리스크를 보수적으로 평가하고 시나리오별 분석을 제공합니다.
재무 데이터는 철저히 기밀로 취급합니다.`;

export async function runFinanceAgent(task: string): Promise<AgentResponse> {
  log("FINANCE", `작업 시작: ${task.slice(0, 40)}...`);

  const response = await query({
    prompt: `${FINANCE_SYSTEM_PROMPT}\n\n---\n\n${task}`,
    options: {
      maxTurns: 8,
      allowedTools: ["Read", "Bash"]
    }
  });

  const result = extractText(response);
  log("FINANCE", "작업 완료");

  return {
    department: "finance",
    result,
    confidence: "medium", // 재무 분석은 항상 전문가 검토 권장
    actionItems: [],
    escalationNeeded: result.includes("이상 징후") ||
      result.includes("예산 초과")
  };
}
```

## 주요 재무 워크플로우

### 1. 월간 지출 보고서 분석

```
> 재무팀: 3월 부서별 지출 현황을 분석하고 이상 징후를 찾아줘.
```

에이전트 응답 예시:
```
## 3월 지출 분석 보고서

### 핵심 요약
- 전체 지출: 2억 3,400만원 (예산 대비 +8.2%)
- 예산 초과 부서: 마케팅(+23%), 개발(+11%)
- 절감 부서: HR(-5%), 운영(-2%)

### 이상 징후
🚨 마케팅팀 광고비 23% 초과
- 원인 추정: Q1 런칭 캠페인 집중 집행
- 권고: Q2 예산 배분 재검토

### 비용 최적화 기회
1. SaaS 구독 중 미사용 3건 (월 180만원 절감 가능)
2. 클라우드 비용 Right-sizing으로 최대 15% 절감
```

### 2. 예산 계획 수립

```typescript
async function createBudgetPlan(
  annualRevenue: number,
  growthTarget: number,
  departments: string[]
) {
  return runFinanceAgent(
    `연간 예산 계획을 수립해줘.

    기준 정보:
    - 전년도 매출: ${annualRevenue.toLocaleString()}원
    - 성장 목표: ${growthTarget}%
    - 예산 배분 대상 부서: ${departments.join(", ")}

    산출 내용:
    1. 부서별 예산 배분안 (비율 및 금액)
    2. 분기별 집행 계획
    3. 핵심 투자 우선순위 (ROI 기준)
    4. 절감 목표 및 방안
    5. 리스크 시나리오 (낙관/기본/보수)`
  );
}
```

### 3. 투자 수익성 분석 (ROI)

```typescript
async function analyzeROI(
  investmentName: string,
  cost: number,
  expectedBenefits: string
) {
  return runFinanceAgent(
    `다음 투자안의 ROI를 분석해줘.

    투자명: ${investmentName}
    총 투자 비용: ${cost.toLocaleString()}원

    기대 효과:
    ${expectedBenefits}

    분석 요청:
    - 손익분기점 (BEP) 계산
    - 3년/5년 ROI 시나리오
    - NPV (순현재가치) 계산 (할인율 10% 적용)
    - 리스크 요인 및 민감도 분석
    - 최종 투자 권고 (진행/보류/조건부 진행)`
  );
}
```

### 4. 현금흐름 예측

```typescript
async function cashFlowForecast(
  currentData: string,
  forecastMonths: number
) {
  return runFinanceAgent(
    `현재 재무 데이터를 기반으로 ${forecastMonths}개월 현금흐름을 예측해줘.

    현재 데이터:
    ${currentData}

    예측 포함 사항:
    - 월별 예상 수입/지출
    - 현금 잔고 추이
    - 자금 부족 위험 구간
    - 여유 현금 운용 방안
    - 단기 자금 조달 필요 여부`
  );
}
```

## AI 기반 비용 절감 자동화

```typescript
// 매월 1일 자동 실행되는 비용 최적화 스크립트
async function monthlyExpenseOptimization() {
  const report = await runFinanceAgent(
    `이번 달 비용 데이터를 분석해서 즉시 실행 가능한 절감 방안을 찾아줘.

    검토 영역:
    1. SaaS 구독 서비스 - 미사용/중복 식별
    2. 클라우드 인프라 - 비효율 리소스
    3. 외부 계약 - 재협상 가능 항목
    4. 운영 지출 - 자동화 가능 업무

    각 항목: 현재 비용, 절감 가능액, 실행 난이도 포함`
  );

  // 10% 이상 절감 가능 시 CFO에게 알림
  if (report.result.includes("10%") || report.result.includes("1천만")) {
    await notifyCFO(report.result);
  }

  return report;
}
```

:::warning 재무 에이전트 사용 주의사항
- AI 분석 결과는 참고용이며 최종 재무 결정은 CFO/재무팀장 승인 필수
- 실제 재무 데이터 입력 시 민감도 등급 확인 후 처리
- 세금, 감가상각, 회계 기준 관련 판단은 회계사 검토 필요
:::

---

다음 챕터: [영업팀 에이전트 →](/docs/capstone/sales-agent)
