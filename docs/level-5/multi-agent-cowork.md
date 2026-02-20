---
sidebar_position: 2
title: 멀티에이전트 Co-work
description: 여러 Claude 인스턴스가 역할을 분담해 협력하는 멀티에이전트 Co-work 아키텍처 설계와 구현 패턴을 배웁니다.
---

# 멀티에이전트 Co-work

멀티에이전트 Co-work는 **여러 Claude 인스턴스가 각자 역할을 맡아 협력**하는 방식입니다. 한 에이전트가 모든 것을 처리하는 대신, 전문화된 에이전트들이 병렬로 작업하고 결과를 통합합니다.

## Co-work vs 단일 에이전트

| 구분 | 단일 에이전트 | 멀티에이전트 Co-work |
|------|-------------|-------------------|
| 처리 방식 | 순차적 | 병렬 |
| 컨텍스트 | 하나의 긴 컨텍스트 | 각자 독립된 컨텍스트 |
| 전문성 | 범용 | 역할별 특화 |
| 속도 | 느림 | 빠름 |
| 비용 | 낮음 | 높음 (병렬만큼 증가) |
| 적합 케이스 | 단순 작업 | 복잡한 대규모 작업 |

## 기본 Co-work 패턴

### 역할 분담 아키텍처

```
[사용자 요청]
      ↓
[코디네이터 에이전트] — 작업 분석 및 역할 배정
      ↓
┌─────────────────────────────────────────────┐
│  [리서처]      [개발자]      [리뷰어]        │
│  (정보 수집)   (코드 작성)   (품질 검토)     │
└─────────────────────────────────────────────┘
      ↓
[코디네이터 에이전트] — 결과 통합 및 최종 응답
```

### Claude Code에서 Co-work 요청

```
> 우리 결제 시스템에 새 기능을 추가해야 해.
  세 가지 역할로 나눠서 진행해줘:

  1. 리서처: 현재 payment/ 코드를 분석해서
     아키텍처와 패턴을 파악해줘
  2. 개발자: 리서처 결과를 바탕으로
     환불 기능 구현해줘
  3. 리뷰어: 개발자 코드를 검토하고
     보안 이슈와 엣지케이스 찾아줘
```

## Agent SDK로 Co-work 구현

### 전문가 패널 패턴

여러 전문가 에이전트가 동일한 문제를 각자 분석:

```typescript
import { query } from "@anthropic-ai/claude-code";

interface ExpertOpinion {
  role: string;
  analysis: string;
  recommendation: string;
}

async function expertPanel(problem: string): Promise<string> {
  const experts = [
    {
      role: "보안 전문가",
      prompt: `보안 전문가로서 다음 문제를 분석해줘.
        보안 취약점과 위험 요소에 집중해:
        ${problem}`
    },
    {
      role: "성능 전문가",
      prompt: `성능 최적화 전문가로서 다음 문제를 분석해줘.
        병목 지점과 확장성 이슈에 집중해:
        ${problem}`
    },
    {
      role: "UX 전문가",
      prompt: `UX 디자이너로서 다음 문제를 분석해줘.
        사용자 경험과 접근성에 집중해:
        ${problem}`
    }
  ];

  // 모든 전문가가 동시에 분석
  const opinions = await Promise.all(
    experts.map(async (expert) => {
      const response = await query({
        prompt: expert.prompt,
        options: { maxTurns: 8 }
      });
      return {
        role: expert.role,
        analysis: extractText(response)
      } as ExpertOpinion;
    })
  );

  // 코디네이터가 의견 종합
  const synthesis = await query({
    prompt: `다음 세 전문가의 의견을 종합해서
    균형 잡힌 최종 권고안을 작성해줘:

    ${opinions.map(o => `### ${o.role}\n${o.analysis}`).join("\n\n")}

    상충되는 의견은 트레이드오프를 설명하고
    우선순위와 함께 제시해줘.`,
    options: { maxTurns: 5 }
  });

  return extractText(synthesis);
}
```

### 파이프라인 Co-work 패턴

각 에이전트가 이전 에이전트의 작업을 이어받아 개선:

```typescript
import { query } from "@anthropic-ai/claude-code";

async function writingPipeline(topic: string): Promise<string> {
  // 1단계: 리서처가 자료 수집
  console.log("📚 리서처: 자료 수집 중...");
  const research = await query({
    prompt: `${topic}에 대해 리서치해줘.
      핵심 개념, 최신 트렌드, 주요 데이터를
      구조화해서 정리해줘.`,
    options: {
      maxTurns: 10,
      allowedTools: ["WebSearch", "Read"]
    }
  });
  const researchResult = extractText(research);

  // 2단계: 작가가 초안 작성
  console.log("✍️ 작가: 초안 작성 중...");
  const draft = await query({
    prompt: `다음 리서치 자료를 바탕으로
    블로그 포스트 초안을 작성해줘.
    독자: 개발자 / 톤: 친근하지만 전문적

    리서치 자료:
    ${researchResult}`,
    options: { maxTurns: 8 }
  });
  const draftResult = extractText(draft);

  // 3단계: 편집자가 다듬기
  console.log("📝 편집자: 교정 및 개선 중...");
  const edited = await query({
    prompt: `다음 블로그 초안을 편집해줘:
    - 명확하지 않은 문장 개선
    - 논리 흐름 점검
    - SEO를 위한 키워드 최적화
    - 독자 참여를 높이는 CTA 추가

    초안:
    ${draftResult}`,
    options: { maxTurns: 6 }
  });

  return extractText(edited);
}
```

## 역할 특화 시스템 프롬프트

각 에이전트에 명확한 페르소나 부여:

```typescript
const agentConfigs = {
  architect: {
    systemPrompt: `당신은 시니어 소프트웨어 아키텍트입니다.
      항상 확장성, 유지보수성, 패턴 일관성을 최우선으로 생각합니다.
      코드 작성보다 설계 결정에 집중하세요.`,
    maxTurns: 5
  },
  developer: {
    systemPrompt: `당신은 풀스택 개발자입니다.
      아키텍처 결정에 따라 실제 구현 코드를 작성합니다.
      테스트 가능하고 읽기 쉬운 코드를 작성하세요.`,
    maxTurns: 20,
    allowedTools: ["Read", "Edit", "Write", "Bash"]
  },
  tester: {
    systemPrompt: `당신은 QA 엔지니어입니다.
      엣지 케이스, 예외 상황, 보안 취약점을 찾는 것이 목표입니다.
      개발자가 놓친 부분을 집중적으로 검토하세요.`,
    maxTurns: 10,
    allowedTools: ["Read", "Glob", "Grep"]
  }
};

async function developFeature(requirement: string) {
  // 1. 아키텍트가 설계
  const designResponse = await query({
    prompt: requirement,
    options: agentConfigs.architect
  });
  const design = extractText(designResponse);

  // 2. 개발자가 구현
  const implementResponse = await query({
    prompt: `다음 아키텍처 설계를 구현해줘:\n${design}`,
    options: agentConfigs.developer
  });
  const implementation = extractText(implementResponse);

  // 3. QA가 검토
  const reviewResponse = await query({
    prompt: `다음 구현 코드를 검토해줘:\n${implementation}`,
    options: agentConfigs.tester
  });

  return {
    design,
    implementation,
    review: extractText(reviewResponse)
  };
}
```

## 충돌 해결 패턴

에이전트 간 의견 충돌을 처리하는 방법:

```typescript
async function resolveConflict(
  agentA: string,
  agentB: string,
  opinions: [string, string]
): Promise<string> {
  const mediator = await query({
    prompt: `두 전문가의 의견이 충돌합니다.
    객관적으로 분석하고 최선의 결론을 도출해줘.

    ${agentA}의 의견:
    ${opinions[0]}

    ${agentB}의 의견:
    ${opinions[1]}

    결론 형식:
    1. 각 의견의 타당한 점
    2. 핵심 충돌 지점
    3. 권장 해결책과 이유`,
    options: { maxTurns: 4 }
  });

  return extractText(mediator);
}
```

## Co-work 설계 원칙

:::tip 효과적인 Co-work 설계
1. **역할 명확화**: 각 에이전트의 책임 범위를 겹치지 않게 정의
2. **인터페이스 통일**: 에이전트 간 데이터 교환 형식을 표준화
3. **독립성 보장**: 한 에이전트의 실패가 전체를 멈추지 않도록 설계
4. **컨텍스트 요약**: 에이전트 간 전달 내용은 핵심만 압축
:::

:::warning 흔한 실수
- 에이전트 간 데이터를 너무 많이 전달 → 컨텍스트 낭비
- 역할 경계가 모호해서 같은 작업을 중복 수행
- 실패 처리 없이 순차적 의존 → 한 에이전트 실패 시 전체 중단
:::

---

다음 챕터: [Agent SDK 심화 →](/docs/level-5/agent-sdk-advanced)
