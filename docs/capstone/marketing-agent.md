---
sidebar_position: 4
title: 마케팅팀 에이전트
description: 콘텐츠 생성, 캠페인 계획, SEO 분석을 수행하는 마케팅팀 에이전트를 구현합니다.
---

# 마케팅팀 에이전트

마케팅팀 에이전트는 **콘텐츠 생성, 캠페인 전략, SEO 최적화**를 담당합니다. 브랜드 목소리를 일관되게 유지하면서 데이터 기반 마케팅 의사결정을 지원합니다.

## 마케팅 에이전트 구현

```typescript
// src/agents/marketing.ts
import { query } from "@anthropic-ai/claude-code";
import { AgentResponse } from "../shared/types";
import { extractText, log } from "../shared/utils";

const MARKETING_SYSTEM_PROMPT = `당신은 B2B SaaS 전문 마케팅 전략가입니다.
데이터 기반 의사결정을 선호하며, 브랜드 일관성을 중시합니다.
모든 콘텐츠는 SEO와 전환율을 동시에 고려합니다.
결과는 항상 실행 가능한 형태로 제시합니다.`;

export async function runMarketingAgent(task: string): Promise<AgentResponse> {
  log("MARKETING", `작업 시작: ${task.slice(0, 40)}...`);

  const response = await query({
    prompt: `${MARKETING_SYSTEM_PROMPT}\n\n---\n\n${task}`,
    options: {
      maxTurns: 12,
      allowedTools: ["Read", "Write", "Glob"]
    }
  });

  const result = extractText(response);
  log("MARKETING", "작업 완료");

  return {
    department: "marketing",
    result,
    confidence: "high",
    actionItems: extractActionItems(result)
  };
}

function extractActionItems(text: string): string[] {
  const lines = text.split("\n");
  return lines
    .filter(l => l.match(/^[-*]\s+|^\d+\.\s+/))
    .map(l => l.replace(/^[-*\d.]\s+/, "").trim())
    .filter(l => l.length > 10)
    .slice(0, 5);
}
```

## 주요 마케팅 워크플로우

### 1. 콘텐츠 캘린더 생성

```
> 마케팅팀: 다음 달 콘텐츠 캘린더를 만들어줘.
  제품: AI 개발 도구 / 타겟: 중견기업 개발팀장
  채널: 블로그, LinkedIn, 뉴스레터
```

에이전트 응답 예시:
```
## 3월 콘텐츠 캘린더

### 블로그 (주 2회)
- 3/3 (월): "AI 코딩 도구로 개발 속도 40% 향상하는 법"
- 3/7 (금): 고객 성공 사례: A사 도입 6개월 결과
- 3/10 (월): "2026년 AI 개발 트렌드 5가지"
...

### LinkedIn (매일)
- 기술 팁 공유 (60%)
- 고객 증언 (20%)
- 회사 문화 (20%)

### 뉴스레터 (격주)
- 3/15: AI 개발 도구 특집호
- 3/29: 독자 Q&A + 제품 업데이트
```

### 2. SEO 콘텐츠 최적화

```typescript
async function seoOptimize(content: string, targetKeyword: string) {
  return runMarketingAgent(
    `다음 콘텐츠를 "${targetKeyword}" 키워드 중심으로 SEO 최적화해줘.

    요구사항:
    - 키워드 밀도 1.5~2.5%
    - 제목/소제목에 키워드 포함
    - 메타 디스크립션 160자 이내 작성
    - 내부/외부 링크 기회 식별
    - 가독성 점수 70 이상

    콘텐츠:
    ${content}`
  );
}
```

### 3. 경쟁사 분석 보고서

```typescript
async function competitorAnalysis(competitors: string[]) {
  return runMarketingAgent(
    `다음 경쟁사들을 분석해서 마케팅 전략 보고서를 작성해줘:
    ${competitors.join(", ")}

    분석 항목:
    1. 각사의 포지셔닝과 USP
    2. 콘텐츠 전략 패턴
    3. 타겟 고객 세그먼트
    4. 우리가 차별화할 수 있는 기회
    5. 즉시 실행 가능한 전술 3가지`
  );
}
```

### 4. 캠페인 성과 분석

```typescript
async function analyzeCampaign(
  campaignData: string,
  campaignName: string
) {
  return runMarketingAgent(
    `${campaignName} 캠페인 성과를 분석하고 개선 방안을 제시해줘.

    성과 데이터:
    ${campaignData}

    분석 요청:
    - 핵심 KPI 달성 여부 평가
    - 채널별 ROI 비교
    - 개선이 필요한 3가지 포인트
    - 다음 캠페인을 위한 A/B 테스트 아이디어`
  );
}
```

## 마케팅 에이전트 특화 프롬프트

마케팅 작업 유형별 최적화된 지시문:

| 작업 유형 | 핵심 지시 |
|---------|---------|
| 블로그 작성 | "AIDA 구조 사용, 첫 단락에서 독자 문제 공감" |
| SNS 카피 | "플랫폼별 최적 길이 준수, CTA 명확히 포함" |
| 이메일 | "제목 35자 이내, 개인화 변수 활용" |
| 보도자료 | "역피라미드 구조, 인용문 2개 이상 포함" |
| 광고 카피 | "핵심 혜택 1가지에 집중, 행동 유도 동사 사용" |

:::tip 마케팅 에이전트 활용 팁
- 브랜드 가이드라인 문서를 `prompts/brand-guide.md`에 저장하고 시스템 프롬프트에 포함
- 과거 성과가 좋은 콘텐츠 샘플을 Few-shot 예시로 제공
- 콘텐츠 생성 후 항상 SEO 점수와 가독성을 함께 요청
:::

---

다음 챕터: [HR팀 에이전트 →](/docs/capstone/hr-agent)
