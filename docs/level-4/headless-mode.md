---
sidebar_position: 3
title: Headless 자동화 모드
description: Claude Code를 대화 없이 스크립트와 파이프라인에서 직접 실행하는 Headless 자동화 패턴을 배웁니다.
---

# Headless 자동화 모드

Headless 모드는 Claude Code를 대화 없이 **스크립트나 파이프라인에서 직접 실행**하는 방식입니다. CI/CD, 배치 작업, 코드 생성 자동화 등에 활용합니다.

## `--print` 플래그

`--print` (`-p`) 플래그를 사용하면 Claude Code가 단일 요청을 처리하고 결과를 stdout으로 출력한 뒤 종료합니다.

```bash
# 기본 사용법
claude --print "이 함수의 복잡도를 분석해줘" < src/complex.ts

# 파일 내용 파이프
cat error.log | claude --print "에러 원인 분석해줘"

# 결과를 파일로 저장
claude --print "API 명세 작성해줘" > docs/api.md
```

## 권한 자동 승인

헤드리스 환경에서는 사용자 승인이 불가능하므로 권한을 사전 설정합니다:

```bash
# 모든 권한 자동 승인 (격리된 CI 환경에서만 사용)
claude --dangerously-skip-permissions --print "코드 수정해줘"
```

또는 `settings.json`으로 특정 도구만 자동 승인:

```json
{
  "permissions": {
    "allow": ["Read(*)", "Write(*)", "Edit(*)", "Bash(npm test)"],
    "deny": ["Bash(rm *)"]
  }
}
```

## 실전 자동화 스크립트

### 배치 파일 처리

여러 파일을 자동으로 처리:

```bash
#!/bin/bash
# 모든 TypeScript 파일에 JSDoc 추가

for file in src/**/*.ts; do
  echo "처리 중: $file"
  claude --print "이 파일의 공개 함수와 클래스에 JSDoc 주석을 추가해줘.
  기존 코드 로직은 변경하지 말고 주석만 추가해줘." < "$file" > "${file}.tmp"

  # 결과 검증 후 교체
  if [ -s "${file}.tmp" ]; then
    mv "${file}.tmp" "$file"
  else
    rm "${file}.tmp"
    echo "경고: $file 처리 실패"
  fi
done

echo "완료!"
```

### 코드 리뷰 리포트 자동 생성

```bash
#!/bin/bash
# PR 리뷰 리포트 생성

BRANCH=${1:-HEAD}
BASE=${2:-main}

DIFF=$(git diff $BASE...$BRANCH)

if [ -z "$DIFF" ]; then
  echo "변경사항 없음"
  exit 0
fi

echo "$DIFF" | claude --print "이 코드 변경사항을 리뷰해줘.
다음 형식으로 마크다운 리포트를 작성해줘:
## 요약
## 주요 변경사항
## 잠재적 문제
## 개선 제안
## 승인 여부 (승인 / 수정 요청)" > review-report.md

echo "리뷰 리포트 생성 완료: review-report.md"
```

### 자동 마이그레이션

```bash
#!/bin/bash
# API v1 → v2 마이그레이션

FILES=$(grep -rl "api/v1" src/)

for file in $FILES; do
  echo "마이그레이션: $file"
  cat "$file" | claude --print "이 파일에서 'api/v1' 엔드포인트를 'api/v2'로 업데이트해줘.
  엔드포인트 경로만 변경하고, 로직은 그대로 유지해줘.
  수정된 전체 파일 내용만 출력해줘 (설명 없이)." > "$file.migrated"

  mv "$file.migrated" "$file"
done
```

## JSON 출력 모드

Claude의 응답을 JSON으로 파싱해야 할 때:

```bash
# JSON 형식으로 응답 요청
RESULT=$(claude --print "이 함수의 복잡도를 분석해줘.
응답을 다음 JSON 형식으로만 출력해줘:
{
  \"complexity\": \"high|medium|low\",
  \"issues\": [\"이슈1\", \"이슈2\"],
  \"score\": 1-10
}" < src/service.ts)

# jq로 파싱
COMPLEXITY=$(echo "$RESULT" | jq -r '.complexity')
echo "복잡도: $COMPLEXITY"
```

## 환경변수 활용

헤드리스 스크립트에서 컨텍스트를 주입:

```bash
#!/bin/bash
# 환경별 설정 주입

ENVIRONMENT=${APP_ENV:-development}
DB_TYPE=${DB_TYPE:-postgresql}

claude --print "이 마이그레이션 스크립트를 $ENVIRONMENT 환경의
$DB_TYPE 데이터베이스에 맞게 수정해줘." < migration.sql
```

## 에러 처리와 재시도

```bash
#!/bin/bash
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  RESULT=$(claude --print "코드 분석해줘" < src/main.ts 2>&1)
  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    echo "$RESULT"
    break
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "실패 ($RETRY_COUNT/$MAX_RETRIES): $RESULT"
    sleep 5
  fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "최대 재시도 초과"
  exit 1
fi
```

## Make/Task Runner 통합

`Makefile`에 Claude 작업 추가:

```makefile
# Makefile

review:
	@echo "코드 리뷰 실행..."
	@git diff main...HEAD | claude --print "코드 리뷰해줘" > review.md
	@echo "리뷰 완료: review.md"

docs:
	@find src -name "*.ts" -exec sh -c \
	  'claude --print "이 파일 API 문서 생성해줘" < {} > docs/{}.md' \;

migrate:
	@claude --print "이 스키마 변경사항에 맞는 마이그레이션 생성해줘" \
	  < schema.diff > migrations/$$(date +%Y%m%d_%H%M%S)_auto.sql
```

:::warning 헤드리스 모드 주의사항
- `--dangerously-skip-permissions`는 반드시 격리된 환경(Docker, CI 샌드박스)에서만 사용
- 헤드리스로 생성된 코드는 반드시 사람이 검토 후 배포
- 비용 모니터링 필수 — 대량 배치 처리 시 예상치 못한 비용 발생 가능
:::

---

다음 챕터: [보안 주의사항 →](/docs/level-4/security)
