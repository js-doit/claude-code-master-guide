---
sidebar_position: 2
title: 커스텀 Skills 만들기
description: Claude Code의 슬래시 커맨드를 커스터마이징하여 팀과 프로젝트에 최적화된 반복 워크플로우를 자동화합니다.
---

# 커스텀 Skills 만들기

Skills(슬래시 커맨드)는 자주 쓰는 복잡한 프롬프트를 `/commit`, `/review` 처럼 단축키로 호출하는 기능입니다. 직접 Skills를 만들면 팀 전체가 동일한 고품질 워크플로우를 단 한 글자 명령으로 실행할 수 있습니다.

## Skills 구조 이해

Skills는 `.claude/commands/` 디렉토리에 Markdown 파일로 저장됩니다.

```
프로젝트/
  .claude/
    commands/
      commit.md       → /commit 명령
      review.md       → /review 명령
      deploy-check.md → /deploy-check 명령
```

전역으로 사용하려면 `~/.claude/commands/`에 저장합니다.

## 첫 번째 Skill 만들기

### 예시: 커밋 메시지 자동화

`.claude/commands/commit.md`:

```markdown
변경된 파일들을 분석하고 Conventional Commits 형식의 커밋 메시지를 작성해줘.

다음 규칙을 따라줘:
- 형식: `type(scope): 한국어 설명`
- type: feat, fix, docs, style, refactor, test, chore
- 설명은 50자 이내
- 변경 내용이 여러 타입에 걸치면 가장 중요한 것 하나만 사용
- 커밋 명령까지 실행해줘: git add -A && git commit -m "..."

먼저 git diff --staged와 git status를 확인하고 진행해줘.
```

저장 후 Claude Code에서:
```
> /commit
```

### 예시: PR 리뷰 요청

`.claude/commands/review.md`:

```markdown
현재 브랜치의 변경사항을 시니어 개발자 관점에서 리뷰해줘.

git diff main...HEAD 를 기반으로:

## 리뷰 항목
1. **버그 가능성** — 논리 오류, 엣지 케이스 누락
2. **코드 품질** — 가독성, 중복, 복잡도
3. **성능** — 불필요한 연산, N+1 쿼리, 메모리 낭비
4. **보안** — 인젝션, 인증 우회, 민감 정보 노출
5. **테스트** — 테스트 커버리지, 빠진 엣지 케이스

각 항목을 [심각도: 높음/중간/낮음/참고]로 분류해줘.
높음 이상은 반드시 수정 방법도 제시해줘.
```

## 변수($ARGUMENTS) 활용

Skills에 인수를 전달할 수 있습니다. `$ARGUMENTS`는 명령 뒤에 입력한 텍스트입니다.

### 예시: 특정 이슈 기반 브랜치 생성

`.claude/commands/branch.md`:

```markdown
GitHub 이슈 번호: $ARGUMENTS

이 이슈에 맞는 git 브랜치를 생성해줘:
1. gh issue view $ARGUMENTS 로 이슈 내용 확인
2. 이슈 제목을 기반으로 브랜치명 생성 (kebab-case)
   예: "feat/123-user-authentication"
3. git checkout -b [브랜치명] 실행
4. 이슈와 브랜치를 연결하는 빈 커밋 생성:
   git commit --allow-empty -m "chore: #$ARGUMENTS 이슈 작업 시작"
```

사용:
```
> /branch 42
```

### 예시: 특정 컴포넌트 생성

`.claude/commands/component.md`:

```markdown
컴포넌트명: $ARGUMENTS

React 컴포넌트를 생성해줘:
- 파일: src/components/$ARGUMENTS/$ARGUMENTS.tsx
- 스타일: src/components/$ARGUMENTS/$ARGUMENTS.module.css
- 테스트: src/components/$ARGUMENTS/$ARGUMENTS.test.tsx
- 배럴: src/components/$ARGUMENTS/index.ts

기존 컴포넌트 (src/components/Button/) 스타일을 참고해서
동일한 패턴으로 만들어줘.
Props는 간단한 placeholder로 시작해도 됩니다.
```

사용:
```
> /component UserCard
```

## 실전 팀 Skill 세트

팀 프로젝트에서 표준화할 만한 Skills 모음:

### `/standup` — 오늘의 작업 요약

`.claude/commands/standup.md`:

```markdown
오늘 내가 작업한 내용을 스탠드업 미팅 형식으로 요약해줘.

git log --since="yesterday" --author="$(git config user.name)" --oneline 을 실행해서
어제/오늘 커밋 내역을 확인하고:

## 어제 한 일
[커밋 내역 기반 요약]

## 오늘 할 일
[현재 브랜치의 미완성 작업 기반 추측]

## 블로커
[없음 / 또는 현재 에러나 막힌 이슈]

3~5줄로 간결하게 작성해줘.
```

### `/changelog` — 릴리즈 노트 생성

`.claude/commands/changelog.md`:

```markdown
버전 태그: $ARGUMENTS

$ARGUMENTS 이후의 변경사항으로 CHANGELOG.md 항목을 작성해줘.

git log $ARGUMENTS..HEAD --oneline 으로 커밋 목록을 가져와서:
- 사용자 관점에서 중요한 변경사항만 선별
- 기술적 세부사항보다 "무엇이 바뀌었나"에 집중
- Added / Changed / Fixed / Removed 섹션으로 분류

CHANGELOG.md 파일 맨 위에 추가해줘.
```

### `/security-check` — 보안 빠른 검사

`.claude/commands/security-check.md`:

```markdown
현재 변경된 파일들에 대해 보안 빠른 검사를 실행해줘.

git diff --name-only HEAD 로 변경 파일 목록을 가져와서:

다음 항목 체크:
- [ ] SQL 인젝션 가능성 (raw query 사용 여부)
- [ ] XSS 취약점 (innerHTML, dangerouslySetInnerHTML)
- [ ] 하드코딩된 시크릿 (API 키, 비밀번호)
- [ ] 인증 없는 민감 엔드포인트
- [ ] CORS 설정 오류

각 항목에 대해 발견 여부와 위치를 알려줘.
```

## Skills 공유 방법

팀원과 Skills를 공유하려면:

```bash
# 프로젝트 레벨 Skills (.claude/commands/)를 git에 포함
git add .claude/commands/
git commit -m "chore: 팀 공통 Claude Skills 추가"
git push
```

팀원이 `git pull` 하면 동일한 Skills를 바로 사용할 수 있습니다.

:::tip Skills vs CLAUDE.md
- **CLAUDE.md**: 항상 적용되는 컨텍스트 (프로젝트 규칙, 구조 설명)
- **Skills**: 명시적으로 호출할 때만 실행되는 특정 워크플로우

반복적으로 입력하는 긴 프롬프트가 있다면 → Skills로 만드세요.
:::

---

다음 챕터: [Headless 자동화 모드 →](/docs/level-4/headless-mode)
