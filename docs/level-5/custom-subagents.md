---
sidebar_position: 4
title: 커스텀 서브에이전트
description: 특정 도메인과 역할에 최적화된 커스텀 서브에이전트를 설계하고 구축하는 실전 방법을 배웁니다.
---

# 커스텀 서브에이전트

커스텀 서브에이전트는 **특정 역할과 도메인에 최적화된 전문 에이전트**입니다. 범용 에이전트보다 더 정확하고 일관된 결과를 만들어냅니다.

## 서브에이전트 설계 원칙

좋은 서브에이전트의 3가지 특성:

1. **단일 책임**: 하나의 역할만 수행
2. **명확한 입출력**: 입력 형식과 출력 형식이 정확히 정의됨
3. **독립 실행 가능**: 다른 에이전트에 의존하지 않음

## 도메인별 서브에이전트 구현

### 코드 리뷰 에이전트

```typescript
import { query } from "@anthropic-ai/claude-code";

interface ReviewResult {
  severity: "critical" | "major" | "minor" | "nitpick";
  file: string;
  line?: number;
  issue: string;
  suggestion: string;
}

async function codeReviewAgent(
  files: string[],
  focusArea: "security" | "performance" | "style" | "all"
): Promise<ReviewResult[]> {
  const focusPrompts = {
    security: "SQL 인젝션, XSS, 인증 누락, 민감한 데이터 노출에 집중",
    performance: "불필요한 루프, N+1 쿼리, 메모리 누수, 캐싱 기회에 집중",
    style: "네이밍 컨벤션, 함수 길이, 주석 품질, DRY 원칙에 집중",
    all: "보안, 성능, 스타일 모두 검토"
  };

  const response = await query({
    prompt: `코드 리뷰 전문가로서 다음 파일들을 검토해줘.
      검토 범위: ${focusPrompts[focusArea]}

      검토 파일:
      ${files.map(f => `- ${f}`).join("\n")}

      결과를 다음 JSON 배열로만 출력해줘:
      [
        {
          "severity": "critical|major|minor|nitpick",
          "file": "파일경로",
          "line": 라인번호(선택),
          "issue": "문제 설명",
          "suggestion": "개선 제안"
        }
      ]`,
    options: {
      maxTurns: 15,
      allowedTools: ["Read", "Glob", "Grep"]
    }
  });

  const text = extractText(response);
  // JSON 추출 (마크다운 코드블록 제거)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
}

// 사용
const issues = await codeReviewAgent(
  ["src/auth/login.ts", "src/api/users.ts"],
  "security"
);
const critical = issues.filter(i => i.severity === "critical");
console.log(`⚠️ 치명적 이슈 ${critical.length}개 발견`);
```

### 문서 생성 에이전트

```typescript
import { query } from "@anthropic-ai/claude-code";

interface DocConfig {
  style: "jsdoc" | "markdown" | "readme";
  language: "ko" | "en";
  includeExamples: boolean;
}

async function docGeneratorAgent(
  sourceFile: string,
  config: DocConfig
): Promise<string> {
  const styleGuides = {
    jsdoc: "JSDoc 형식으로 각 함수/클래스에 @param, @returns, @example 포함",
    markdown: "Markdown 형식의 API 레퍼런스 문서",
    readme: "프로젝트 README.md 형식 (설치, 사용법, API 개요)"
  };

  const response = await query({
    prompt: `기술 문서 작성 전문가로서 다음 소스 파일의 문서를 생성해줘.

      파일: ${sourceFile}
      문서 스타일: ${styleGuides[config.style]}
      언어: ${config.language === "ko" ? "한국어" : "English"}
      예제 포함: ${config.includeExamples ? "yes (실제 사용 사례 포함)" : "no"}

      소스 코드를 읽고 완전한 문서를 작성해줘.`,
    options: {
      maxTurns: 10,
      allowedTools: ["Read"]
    }
  });

  return extractText(response);
}
```

### 테스트 생성 에이전트

```typescript
import { query } from "@anthropic-ai/claude-code";

async function testGeneratorAgent(
  sourceFile: string,
  framework: "jest" | "vitest" | "pytest"
): Promise<void> {
  const testFile = sourceFile
    .replace("/src/", "/tests/")
    .replace(".ts", ".test.ts")
    .replace(".py", "_test.py");

  await query({
    prompt: `테스트 자동화 전문가로서 ${sourceFile} 파일의 단위 테스트를 작성해줘.

      테스트 프레임워크: ${framework}
      출력 파일: ${testFile}

      요구사항:
      1. 모든 public 함수/메서드 테스트
      2. 정상 케이스 + 엣지 케이스 포함
      3. 에러 케이스 (예외, null, 빈 값) 포함
      4. 각 테스트에 명확한 describe/it 블록 사용
      5. AAA 패턴 (Arrange, Act, Assert) 준수`,
    options: {
      maxTurns: 20,
      allowedTools: ["Read", "Write", "Bash"]
    }
  });

  console.log(`✅ 테스트 파일 생성: ${testFile}`);
}
```

## 도메인 특화 에이전트 조합

여러 특화 에이전트를 워크플로우로 연결:

```typescript
import { query } from "@anthropic-ai/claude-code";

async function fullDevelopmentWorkflow(feature: string) {
  console.log("🏗️ 개발 워크플로우 시작:", feature);

  // 1. 설계 에이전트
  const design = await query({
    prompt: `시니어 아키텍트로서 "${feature}" 기능의 설계를 작성해줘.
      - 데이터 구조
      - API 엔드포인트
      - 구현해야 할 파일 목록
      결과를 구조화된 형식으로 출력해줘.`,
    options: { maxTurns: 5 }
  });
  const designResult = extractText(design);
  console.log("✅ 설계 완료");

  // 2. 구현 에이전트
  await query({
    prompt: `풀스택 개발자로서 다음 설계를 구현해줘:
      ${designResult}
      테스트 없이 실제 구현 코드만 작성해줘.`,
    options: {
      maxTurns: 30,
      allowedTools: ["Read", "Edit", "Write", "Bash"]
    }
  });
  console.log("✅ 구현 완료");

  // 3. 테스트 에이전트 (병렬 실행)
  const [unitTests, integrationTests] = await Promise.all([
    query({
      prompt: `방금 구현된 "${feature}" 기능의 단위 테스트를 Jest로 작성해줘.`,
      options: { maxTurns: 15, allowedTools: ["Read", "Write", "Glob"] }
    }),
    query({
      prompt: `방금 구현된 "${feature}" 기능의 통합 테스트를 Jest + Supertest로 작성해줘.`,
      options: { maxTurns: 15, allowedTools: ["Read", "Write", "Glob"] }
    })
  ]);
  console.log("✅ 테스트 작성 완료");

  // 4. 문서 에이전트
  await query({
    prompt: `방금 구현된 "${feature}" 기능의 API 문서를 마크다운으로 작성해줘.`,
    options: { maxTurns: 8, allowedTools: ["Read", "Write", "Glob"] }
  });
  console.log("✅ 문서 작성 완료");

  // 5. 리뷰 에이전트
  const review = await query({
    prompt: `시니어 리뷰어로서 방금 구현된 "${feature}" 기능 전체를 검토해줘.
      보안, 성능, 코드 품질, 테스트 커버리지를 중점으로 최종 승인 여부를 결정해줘.`,
    options: { maxTurns: 10, allowedTools: ["Read", "Glob", "Grep"] }
  });

  return {
    design: designResult,
    review: extractText(review)
  };
}
```

## 에이전트 레지스트리 패턴

재사용 가능한 에이전트를 중앙에서 관리:

```typescript
import { query } from "@anthropic-ai/claude-code";

interface AgentDefinition {
  name: string;
  description: string;
  systemPrompt: string;
  allowedTools: string[];
  maxTurns: number;
}

class AgentRegistry {
  private agents = new Map<string, AgentDefinition>();

  register(agent: AgentDefinition) {
    this.agents.set(agent.name, agent);
    return this;
  }

  async run(agentName: string, userPrompt: string): Promise<string> {
    const agent = this.agents.get(agentName);
    if (!agent) throw new Error(`에이전트 없음: ${agentName}`);

    const fullPrompt = `${agent.systemPrompt}\n\n---\n\n${userPrompt}`;
    const messages: any[] = [];

    for await (const msg of query({
      prompt: fullPrompt,
      options: {
        maxTurns: agent.maxTurns,
        allowedTools: agent.allowedTools as any
      }
    })) {
      messages.push(msg);
    }

    return extractText(messages);
  }

  list(): string[] {
    return [...this.agents.keys()];
  }
}

// 레지스트리 구성
const registry = new AgentRegistry()
  .register({
    name: "security-auditor",
    description: "보안 취약점 감사 전문가",
    systemPrompt: "당신은 사이버보안 전문가입니다. OWASP Top 10을 기준으로 코드를 분석합니다.",
    allowedTools: ["Read", "Glob", "Grep"],
    maxTurns: 15
  })
  .register({
    name: "performance-optimizer",
    description: "성능 최적화 전문가",
    systemPrompt: "당신은 성능 엔지니어입니다. 병목 지점을 찾고 최적화 방안을 제시합니다.",
    allowedTools: ["Read", "Bash"],
    maxTurns: 10
  })
  .register({
    name: "tech-writer",
    description: "기술 문서 작성자",
    systemPrompt: "당신은 개발자 경험(DX) 전문가입니다. 명확하고 친근한 기술 문서를 작성합니다.",
    allowedTools: ["Read", "Write"],
    maxTurns: 8
  });

// 사용
const auditResult = await registry.run("security-auditor", "src/api/ 폴더를 감사해줘");
const perfResult = await registry.run("performance-optimizer", "database/queries.ts 최적화해줘");
```

:::tip 커스텀 에이전트 설계 팁
- 시스템 프롬프트에 **역할, 전문 영역, 출력 형식**을 명확히 정의
- 각 에이전트는 최소한의 도구만 허용 (최소 권한 원칙)
- 출력 형식을 JSON으로 고정하면 파싱이 쉬워짐
- 에이전트 이름은 역할을 명확히 설명 (`security-auditor` > `agent1`)
:::

---

다음 챕터: [Claude API 패턴 →](/docs/level-5/claude-api-patterns)
