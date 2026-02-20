---
sidebar_position: 7
title: CI/CD 통합
description: Claude Code를 GitHub Actions, GitLab CI 등 CI/CD 파이프라인에 통합하여 자동화된 개발 워크플로우를 구축하는 방법을 배웁니다.
---

# CI/CD 통합

Claude Code를 CI/CD 파이프라인에 통합하면, PR 자동 리뷰, 코드 품질 검사, 자동 문서화 등을 파이프라인의 일부로 만들 수 있습니다. 개발자가 PR을 올리는 순간부터 배포까지 AI가 지원하는 워크플로우가 완성됩니다.

## 핵심 활용 시나리오

- **PR 자동 리뷰**: PR 생성 시 Claude가 코드 리뷰 코멘트 작성
- **자동 테스트 생성**: 새 코드에 대한 테스트 자동 제안
- **릴리즈 노트 자동화**: 커밋 기록에서 릴리즈 노트 생성
- **코드 품질 게이트**: 품질 기준 미달 시 PR 차단

## GitHub Actions 통합

### 기본 설정: PR 리뷰 자동화

`.github/workflows/claude-review.yml`:

```yaml
name: Claude Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # 변경된 파일 목록 가져오기
          CHANGED_FILES=$(git diff --name-only origin/${{ github.base_ref }}...HEAD)

          # Claude Code로 리뷰 실행
          claude --print "다음 파일들의 변경사항을 리뷰해줘.
          버그, 보안 이슈, 성능 문제, 코드 스타일을 확인해줘.
          각 파일별로 구체적인 피드백을 제공해줘:
          $CHANGED_FILES" > review.md

          # PR에 코멘트 작성
          gh pr comment ${{ github.event.pull_request.number }} --body-file review.md
```

### 테스트 커버리지 체크

```yaml
name: Coverage Check

on:
  pull_request:

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests with coverage
        run: npm test -- --coverage --json --outputFile=coverage.json

      - name: Check coverage with Claude
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --print "coverage.json 파일을 분석해서
          커버리지가 80% 미만인 파일 목록과
          테스트가 필요한 핵심 함수를 알려줘" > coverage-report.md
          cat coverage-report.md
```

### 자동 릴리즈 노트 생성

```yaml
name: Release Notes

on:
  push:
    tags:
      - 'v*'

jobs:
  release-notes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Generate Release Notes
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # 이전 태그와 현재 태그 사이의 커밋 목록
          PREV_TAG=$(git describe --tags --abbrev=0 HEAD~1)
          COMMITS=$(git log $PREV_TAG..HEAD --oneline)

          claude --print "다음 커밋 목록을 바탕으로
          사용자 친화적인 한국어 릴리즈 노트를 작성해줘.
          새 기능, 버그 수정, 개선사항으로 분류해줘:
          $COMMITS" > release-notes.md

          # GitHub 릴리즈에 업로드
          gh release edit ${{ github.ref_name }} --notes-file release-notes.md
```

## GitLab CI 통합

`.gitlab-ci.yml`:

```yaml
stages:
  - review
  - test
  - deploy

claude-review:
  stage: review
  image: node:20
  script:
    - npm install -g @anthropic-ai/claude-code
    - CHANGED=$(git diff --name-only origin/main...HEAD)
    - claude --print "코드 리뷰: $CHANGED" > review.md
    - cat review.md
  only:
    - merge_requests
  variables:
    ANTHROPIC_API_KEY: $ANTHROPIC_API_KEY
```

## 헤드리스 모드 활용

CI 환경에서는 `--print` 플래그로 비대화형 모드를 사용합니다:

```bash
# 단일 명령 실행 후 종료
claude --print "이 코드의 보안 취약점 분석해줘" < vulnerable-code.ts

# 파이프라인 입력 처리
cat error.log | claude --print "이 에러 로그 분석해서 근본 원인 찾아줘"

# 출력을 파일로 저장
claude --print "API 문서 생성해줘" > docs/api.md
```

## 보안 설정

### API 키 관리

```yaml
# GitHub Secrets에 저장
env:
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

절대 워크플로우 파일에 API 키를 직접 입력하지 마세요.

### 권한 최소화

```yaml
permissions:
  contents: read        # 코드 읽기만
  pull-requests: write  # PR 코멘트 작성
  issues: write         # 이슈 코멘트 (필요시)
```

:::warning CI 환경에서의 Claude Code
CI에서 Claude Code를 사용할 때는 `--dangerously-skip-permissions` 플래그가 필요할 수 있습니다. 이는 CI 샌드박스 환경에서만 사용하고, 실제 프로덕션 시스템 접근 권한과 격리된 환경에서만 실행하세요.
:::

## 실전 워크플로우: 완전한 파이프라인

```yaml
name: Full CI Pipeline with Claude

on:
  pull_request:
  push:
    branches: [main]

jobs:
  # 1단계: 린트 및 빌드
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run lint

  # 2단계: 테스트
  test:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage

  # 3단계: Claude 리뷰 (PR에만 실행)
  claude-review:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'pull_request'
    permissions:
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code
      - name: Review PR
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          DIFF=$(git diff origin/${{ github.base_ref }}...HEAD -- '*.ts' '*.js' | head -200)
          claude --print "PR 코드 리뷰해줘: $DIFF" | \
            gh pr comment ${{ github.event.pull_request.number }} --body-file -

  # 4단계: 배포 (main 브랜치에만)
  deploy:
    runs-on: ubuntu-latest
    needs: [build, test]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: echo "배포 스크립트 실행"
```

## 비용 고려사항

CI에서 Claude API를 사용하면 비용이 발생합니다:

- PR마다 리뷰를 실행하면 PR 수 × 비용
- 큰 PR은 더 많은 토큰을 사용

**비용 절감 전략**:
```yaml
# 특정 브랜치나 레이블의 PR에만 실행
if: contains(github.event.pull_request.labels.*.name, 'needs-review')

# 변경 파일 수 제한
- name: Check file count
  run: |
    COUNT=$(git diff --name-only origin/main...HEAD | wc -l)
    if [ $COUNT -gt 20 ]; then
      echo "파일 수 초과 - Claude 리뷰 스킵"
      exit 0
    fi
```

---

다음 챕터: [대규모 코드베이스 →](/docs/level-3/large-codebase)
