---
sidebar_position: 9
title: 법무팀 에이전트
description: 계약서 검토, 컴플라이언스 확인, 리스크 분석을 수행하는 법무팀 에이전트를 구현합니다.
---

# 법무팀 에이전트

법무팀 에이전트는 **계약서 검토, 컴플라이언스 점검, 법적 리스크 분석**을 담당합니다. 법무 전문 지식이 없는 팀도 계약 관련 위험을 사전에 파악할 수 있도록 지원합니다.

:::warning 중요 면책 고지
법무 에이전트의 분석은 **참고용**입니다. 법적 효력이 있는 계약 체결, 소송 대응, 규제 준수 결정은 반드시 자격 있는 변호사의 검토를 거쳐야 합니다.
:::

## 법무 에이전트 구현

```typescript
// src/agents/legal.ts
import { query } from "@anthropic-ai/claude-code";
import { AgentResponse } from "../shared/types";
import { extractText, log } from "../shared/utils";

const LEGAL_SYSTEM_PROMPT = `당신은 기업 법무 전문가입니다.
계약서 검토, 리스크 분석, 컴플라이언스 확인을 수행합니다.
모든 분석 결과는 '참고용'임을 명확히 하고, 중요 사안은 변호사 검토를 권고합니다.
리스크를 3단계(높음/중간/낮음)로 명확하게 분류합니다.`;

export async function runLegalAgent(task: string): Promise<AgentResponse> {
  log("LEGAL", `작업 시작: ${task.slice(0, 40)}...`);

  const response = await query({
    prompt: `${LEGAL_SYSTEM_PROMPT}\n\n---\n\n${task}`,
    options: {
      maxTurns: 10,
      allowedTools: ["Read"] // 법무는 읽기만 허용 (수정 금지)
    }
  });

  const result = extractText(response);
  const hasHighRisk = result.includes("높음") ||
    result.includes("즉시") ||
    result.includes("변호사 검토 필요");

  log("LEGAL", `작업 완료 (고위험: ${hasHighRisk ? "있음" : "없음"})`);

  return {
    department: "legal",
    result,
    confidence: "medium", // 법무는 항상 전문가 확인 필요
    escalationNeeded: hasHighRisk,
    actionItems: hasHighRisk ? ["변호사 검토 요청"] : []
  };
}
```

## 주요 법무 워크플로우

### 1. 계약서 리스크 검토

```
> 법무팀: 다음 SaaS 구독 계약서의 위험 조항을 검토해줘.
  [계약서 내용 첨부]
```

에이전트 응답 예시:
```
## 계약서 리스크 분석 보고서

### 🔴 고위험 조항 (즉시 검토 필요)
1. 제 12조 데이터 소유권
   현재: "서비스 이용 중 생성된 모든 데이터는 공급사 소유"
   문제: 고객 데이터 소유권 박탈 위험
   권고: "고객 데이터는 고객 소유이며..."로 수정 요청

2. 제 18조 책임 제한
   현재: 손해배상 한도 없음
   문제: 무한 책임 노출
   권고: "연간 계약금액의 2배 이내" 상한선 협상

### 🟡 중위험 조항 (협상 권고)
3. 제 7조 가격 인상 조항
   현재: 연 최대 20% 인상 가능
   문제: 예산 계획 불확실성
   권고: 5% 상한 또는 CPI 연동으로 협상

### 🟢 일반 검토 완료
- 계약 기간, 해지 조건, 지식재산권 조항 이상 없음

### 최종 권고
변호사 검토 후 1, 2번 조항 수정 요청 필수
```

### 2. 개인정보처리방침 컴플라이언스 점검

```typescript
async function checkPrivacyCompliance(
  privacyPolicy: string,
  regulations: string[]
) {
  return runLegalAgent(
    `다음 개인정보처리방침이 규정을 준수하는지 점검해줘.

    적용 규정: ${regulations.join(", ")}

    점검 항목:
    1. 수집 항목 및 목적 명시 여부
    2. 보유 기간 명확성
    3. 제3자 제공/위탁 고지
    4. 정보주체 권리 안내 (열람/정정/삭제/이동)
    5. 개인정보 보호책임자 정보

    개인정보처리방침:
    ${privacyPolicy}`
  );
}
```

### 3. NDA(비밀유지계약) 표준 검토

```typescript
async function reviewNDA(ndaContent: string, companyRole: string) {
  return runLegalAgent(
    `우리 회사가 ${companyRole}(제공자/수령자)인 NDA를 검토해줘.

    NDA 내용:
    ${ndaContent}

    검토 포인트:
    - 비밀정보 정의 범위 (너무 넓거나 좁은지)
    - 의무 존속 기간 (일반적으로 2~5년)
    - 예외 조항 (공지 정보, 독자 개발 등)
    - 위반 시 구제 수단
    - 관할 법원 및 준거법

    최종: 서명 가능 여부 + 수정 요청 사항`
  );
}
```

### 4. 규정 변경 모니터링

```typescript
async function complianceUpdate(
  newRegulation: string,
  currentPolicies: string
) {
  return runLegalAgent(
    `새로운 규정 변경에 따른 컴플라이언스 영향을 분석해줘.

    새 규정: ${newRegulation}
    현행 정책: ${currentPolicies}

    분석:
    1. 현행 정책 중 변경 필요 항목
    2. 신규 도입이 필요한 정책/절차
    3. 이행 기한 및 우선순위
    4. 위반 시 페널티 (과징금 등)
    5. 대응 로드맵 (즉시/단기/중기)`
  );
}
```

## 법무 에이전트 안전 설계

```typescript
// 법무 에이전트는 추가 안전장치 적용
const LEGAL_HIGH_RISK_KEYWORDS = [
  "소송", "고소", "손해배상", "형사", "공정거래", "독점"
];

export async function runLegalAgentSafe(task: string): Promise<AgentResponse> {
  const result = await runLegalAgent(task);

  // 고위험 키워드 감지 시 즉시 에스컬레이션
  const hasHighRiskKeyword = LEGAL_HIGH_RISK_KEYWORDS.some(kw =>
    task.includes(kw) || result.result.includes(kw)
  );

  return {
    ...result,
    escalationNeeded: true, // 법무는 항상 인간 검토
    result: result.result + "\n\n---\n⚠️ **이 분석은 참고용입니다. 법적 결정은 변호사와 상의하세요.**"
  };
}
```

:::tip 법무 에이전트 활용 팁
- 계약서 검토는 전체 텍스트를 한 번에 제공 (컨텍스트 분산 금지)
- 자주 사용하는 계약 유형별 체크리스트를 시스템 프롬프트에 포함
- 고위험 판정 시 자동으로 법무 담당자에게 Slack 알림 발송
:::

---

다음 챕터: [CS팀 에이전트 →](/docs/capstone/cs-agent)
