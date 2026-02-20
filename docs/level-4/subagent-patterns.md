---
sidebar_position: 6
title: 서브에이전트 패턴
description: 오케스트레이터-서브에이전트 아키텍처로 복잡한 작업을 병렬 처리하고 대규모 자동화를 구현하는 패턴을 배웁니다.
---

# 서브에이전트 패턴

서브에이전트 패턴은 **하나의 오케스트레이터 에이전트가 여러 서브에이전트에게 작업을 분배**하는 아키텍처입니다. 대규모 작업을 병렬로 처리하거나, 독립적인 단계들을 조율할 때 강력한 패턴입니다.

## 기본 아키텍처

```
사용자 요청
    ↓
[오케스트레이터] — 작업 분석 및 계획
    ↓
┌───────────────────────────────┐
[서브에이전트 A]  [서브에이전트 B]  [서브에이전트 C]
  (모듈 X 분석)    (모듈 Y 분석)    (모듈 Z 분석)
└───────────────────────────────┘
    ↓
[오케스트레이터] — 결과 통합 및 최종 응답
```

## Claude Code의 Task 도구

Claude Code 내에서 서브에이전트는 `Task` 도구로 구현됩니다.

```
> 세 개의 마이크로서비스를 동시에 분석해줘:
  1. auth-service/ — 인증 로직 검토
  2. payment-service/ — 결제 플로우 검토
  3. notification-service/ — 알림 시스템 검토

  각 서비스는 독립적으로 분석하고, 마지막에 종합 리포트 작성해줘.
```

Claude가 내부적으로 세 개의 서브에이전트를 병렬 실행합니다.

## Agent SDK로 서브에이전트 구현

### 병렬 처리 패턴

```typescript
import { query } from "@anthropic-ai/claude-code";

async function analyzeModulesInParallel(modules: string[]) {
  // 모든 모듈을 동시에 분석
  const analyses = await Promise.all(
    modules.map(module =>
      query({
        prompt: `${module} 디렉토리를 분석해줘:
          - 코드 품질 평가
          - 잠재적 버그
          - 개선 제안`,
        options: {
          cwd: process.cwd(),
          maxTurns: 10,
          allowedTools: ["Read", "Glob", "Grep"],
        }
      })
    )
  );

  return analyses;
}

// 사용
const modules = ["src/auth", "src/payment", "src/notification"];
const results = await analyzeModulesInParallel(modules);
```

### 오케스트레이터 패턴

```typescript
import { query } from "@anthropic-ai/claude-code";

async function orchestrate(task: string) {
  // 1단계: 오케스트레이터가 작업 계획 수립
  const planResponse = await query({
    prompt: `다음 작업을 독립적인 서브태스크로 분해해줘.
    JSON 형식으로 응답해줘:
    {"subtasks": ["서브태스크1", "서브태스크2", ...]}

    작업: ${task}`,
    options: { maxTurns: 3 }
  });

  const planText = extractText(planResponse);
  const { subtasks } = JSON.parse(planText);

  // 2단계: 서브에이전트 병렬 실행
  console.log(`${subtasks.length}개 서브태스크 병렬 실행 중...`);
  const results = await Promise.all(
    subtasks.map((subtask: string) =>
      query({
        prompt: subtask,
        options: { maxTurns: 15 }
      }).then(extractText)
    )
  );

  // 3단계: 오케스트레이터가 결과 통합
  const summary = await query({
    prompt: `다음 서브태스크 결과들을 종합해서 최종 리포트를 작성해줘:

    ${results.map((r, i) => `## 서브태스크 ${i + 1}\n${r}`).join("\n\n")}`,
    options: { maxTurns: 5 }
  });

  return extractText(summary);
}

function extractText(messages: any[]): string {
  return messages
    .filter(m => m.type === "assistant")
    .flatMap(m => m.content)
    .filter(c => c.type === "text")
    .map(c => c.text)
    .join("\n");
}
```

### 순차 파이프라인 패턴

이전 단계 결과를 다음 단계에 전달:

```typescript
import { query } from "@anthropic-ai/claude-code";

async function sequentialPipeline(codebase: string) {
  // 1단계: 코드 분석
  const analysis = await query({
    prompt: `${codebase}를 분석해서 리팩토링이 필요한 파일 목록을 제공해줘`,
    options: { maxTurns: 10 }
  });
  const analysisResult = extractText(analysis);

  // 2단계: 리팩토링 계획 (이전 결과 활용)
  const plan = await query({
    prompt: `다음 분석 결과를 바탕으로 단계별 리팩토링 계획을 세워줘:
    ${analysisResult}`,
    options: { maxTurns: 5 }
  });
  const planResult = extractText(plan);

  // 3단계: 실제 리팩토링 실행
  const refactored = await query({
    prompt: `다음 계획에 따라 리팩토링을 실행해줘:
    ${planResult}`,
    options: {
      maxTurns: 30,
      allowedTools: ["Read", "Edit", "Write", "Bash"],
    }
  });

  return extractText(refactored);
}
```

## 실전 패턴: 코드베이스 전체 감사

```typescript
import { query } from "@anthropic-ai/claude-code";
import * as fs from "fs";
import * as path from "path";

async function fullCodebaseAudit(rootDir: string) {
  // 모든 서비스 디렉토리 탐색
  const services = fs.readdirSync(rootDir)
    .filter(f => fs.statSync(path.join(rootDir, f)).isDirectory())
    .filter(f => !f.startsWith('.') && f !== 'node_modules');

  console.log(`${services.length}개 서비스 감사 시작...`);

  // 병렬로 각 서비스 감사
  const auditResults = await Promise.allSettled(
    services.map(async (service) => {
      const result = await query({
        prompt: `${service} 서비스를 감사해줘:
          1. 보안 취약점
          2. 코드 품질 이슈
          3. 성능 문제
          4. 테스트 커버리지 부족

          심각도 높음/중간/낮음으로 분류해줘.`,
        options: {
          cwd: path.join(rootDir, service),
          maxTurns: 15,
          allowedTools: ["Read", "Glob", "Grep"],
        }
      });

      return { service, result: extractText(result) };
    })
  );

  // 결과 수집
  const successful = auditResults
    .filter(r => r.status === "fulfilled")
    .map(r => (r as PromiseFulfilledResult<any>).value);

  const failed = auditResults
    .filter(r => r.status === "rejected")
    .length;

  // 종합 리포트 생성
  const report = await query({
    prompt: `다음 ${successful.length}개 서비스 감사 결과를 종합해서
    경영진 보고용 요약 리포트를 작성해줘:

    ${successful.map(s => `## ${s.service}\n${s.result}`).join("\n\n")}

    ${failed > 0 ? `\n주의: ${failed}개 서비스 감사 실패` : ""}`,
    options: { maxTurns: 5 }
  });

  return {
    summary: extractText(report),
    details: successful,
    failedCount: failed
  };
}
```

## 서브에이전트 설계 원칙

### 1. 독립성 확보
각 서브에이전트는 독립적으로 실행 가능해야 합니다:
```
✅ 좋음: "auth/ 폴더만 분석해줘"
❌ 나쁨: "이전 에이전트가 찾은 파일을 분석해줘"
```

### 2. 명확한 출력 형식 지정
오케스트레이터가 파싱하기 쉽도록:
```
"결과를 JSON 형식으로만 출력해줘"
"## 발견사항 ## 권고사항 섹션으로 구조화해줘"
```

### 3. 실패 처리
```typescript
// Promise.allSettled로 일부 실패도 처리
const results = await Promise.allSettled(agents.map(runAgent));
const successful = results.filter(r => r.status === "fulfilled");
```

### 4. 비용 고려
병렬 실행은 비용도 병렬로 증가합니다. 적절한 `maxTurns` 설정이 중요합니다.

---

다음 챕터: [Docker 환경 →](/docs/level-4/docker-environment)
