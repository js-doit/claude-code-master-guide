---
sidebar_position: 5
title: HR팀 에이전트
description: 채용 공고 작성, 온보딩 프로그램 설계, 성과 리뷰를 지원하는 HR팀 에이전트를 구현합니다.
---

# HR팀 에이전트

HR팀 에이전트는 **채용, 온보딩, 성과관리, 조직문화** 관련 작업을 처리합니다. 반복적인 HR 업무를 자동화하면서 사람 중심의 따뜻한 문화를 유지합니다.

## HR 에이전트 구현

```typescript
// src/agents/hr.ts
import { query } from "@anthropic-ai/claude-code";
import { AgentResponse } from "../shared/types";
import { extractText, log } from "../shared/utils";

const HR_SYSTEM_PROMPT = `당신은 People & Culture 전문가입니다.
데이터 기반 HR 의사결정을 지지하며, 직원 경험(EX)을 최우선으로 생각합니다.
다양성과 포용성(D&I)을 모든 HR 프로세스에 반영합니다.
개인 정보와 민감한 데이터를 철저히 보호합니다.`;

export async function runHRAgent(task: string): Promise<AgentResponse> {
  log("HR", `작업 시작: ${task.slice(0, 40)}...`);

  const response = await query({
    prompt: `${HR_SYSTEM_PROMPT}\n\n---\n\n${task}`,
    options: {
      maxTurns: 10,
      allowedTools: ["Read", "Write"]
    }
  });

  const result = extractText(response);
  log("HR", "작업 완료");

  return {
    department: "hr",
    result,
    confidence: "high",
    actionItems: [],
    escalationNeeded: result.toLowerCase().includes("법적") ||
      result.toLowerCase().includes("징계")
  };
}
```

## 주요 HR 워크플로우

### 1. 채용 공고 작성

```
> HR팀: 시니어 풀스택 개발자 채용 공고를 작성해줘.
  스택: React, Node.js, PostgreSQL
  경력: 5년 이상 / 위치: 서울 (하이브리드)
  연봉: 8천~1억 2천
```

에이전트 응답 예시:
```
## 시니어 풀스택 개발자 (Senior Full Stack Engineer)

### 이런 일을 하게 됩니다
- 사용자가 매일 쓰는 핵심 제품 기능 설계 및 개발
- 기술 부채 해결과 코드 품질 문화 주도
- 주니어 개발자 멘토링 및 코드 리뷰

### 이런 분을 찾습니다
- React + Node.js 실무 경험 5년 이상
- PostgreSQL 쿼리 최적화 경험
- 자기 주도적으로 문제를 정의하고 해결하는 분

### 우대 사항 (없어도 괜찮아요)
- TypeScript 사용 경험
- 클라우드(AWS/GCP) 운영 경험
...
```

### 2. 온보딩 프로그램 설계

```typescript
async function designOnboarding(
  role: string,
  department: string,
  startDate: string
) {
  return runHRAgent(
    `${role} 포지션 신규 입사자의 30-60-90일 온보딩 프로그램을 설계해줘.

    부서: ${department}
    입사일: ${startDate}

    포함해야 할 내용:
    - Day 1: 첫날 경험 (환영, 장비 설정, 팀 소개)
    - Week 1: 회사/제품/문화 이해
    - 30일: 역할 핵심 역량 기초
    - 60일: 독립적 업무 수행
    - 90일: 성과 첫 평가 및 목표 설정

    체크리스트 형태로 작성해줘.`
  );
}
```

### 3. 성과 리뷰 템플릿 생성

```typescript
async function generatePerformanceReview(
  employeeName: string,
  role: string,
  achievements: string,
  period: string
) {
  return runHRAgent(
    `${employeeName} (${role})의 ${period} 성과 리뷰 초안을 작성해줘.

    주요 성과:
    ${achievements}

    리뷰 구성:
    1. 핵심 성과 요약 (3~5개 bullet)
    2. 역량 평가 (기술/협업/리더십/성장)
    3. 개선 기회 (건설적 피드백)
    4. 다음 분기 목표 설정 (SMART 기준)
    5. 전반적 등급 권고안

    긍정적이고 성장 지향적 톤으로 작성해줘.`
  );
}
```

### 4. 직원 만족도 설문 분석

```typescript
async function analyzeSurveyResults(surveyData: string) {
  return runHRAgent(
    `직원 만족도 설문 결과를 분석하고 개선 우선순위를 제안해줘.

    설문 데이터:
    ${surveyData}

    분석 요청:
    - 강점 영역 (점수 높은 항목)
    - 개선 필요 영역 (점수 낮은 항목)
    - 부서별 특이사항
    - 이전 분기 대비 변화
    - 즉시 실행 가능한 개선안 3가지
    - 장기 문화 개선 방향`
  );
}
```

## HR 에이전트 특화 설정

```typescript
// 민감한 데이터 처리 시 추가 안전장치
const HR_SENSITIVE_KEYWORDS = [
  "급여", "연봉", "징계", "해고", "소송",
  "차별", "성희롱", "개인정보"
];

export async function runHRAgentSafe(task: string): Promise<AgentResponse> {
  const isSensitive = HR_SENSITIVE_KEYWORDS.some(kw =>
    task.toLowerCase().includes(kw)
  );

  if (isSensitive) {
    log("HR", "민감한 사안 감지 → HR 담당자 검토 필요 표시");
  }

  const result = await runHRAgent(task);
  return {
    ...result,
    escalationNeeded: isSensitive || result.escalationNeeded
  };
}
```

:::warning HR 에이전트 사용 주의사항
- 급여, 징계, 해고 관련 결정은 반드시 HR 담당자가 최종 검토
- 개인 식별 정보(이름, 사번)는 프롬프트에 최소화
- 법적 효력이 있는 문서(계약서, 경고장)는 법무팀 에이전트와 연계
:::

---

다음 챕터: [개발팀 에이전트 →](/docs/capstone/dev-agent)
