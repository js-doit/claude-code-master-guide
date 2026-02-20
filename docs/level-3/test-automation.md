---
sidebar_position: 6
title: 테스트 자동화
description: Claude Code와 함께 TDD를 실천하고, 테스트 작성을 자동화하여 코드 품질을 높이는 방법을 배웁니다.
---

# 테스트 자동화

Claude Code는 테스트 작성의 가장 큰 장벽인 **"처음 시작하기"**와 **"반복 작업"**을 없애줍니다. TDD(테스트 주도 개발)를 실천하고, 테스트 커버리지를 높이고, 회귀 버그를 예방하는 워크플로우를 구축해봅시다.

## Claude Code와 TDD

TDD의 원칙은 간단합니다: **테스트 먼저, 구현 나중.** Claude Code는 이 사이클을 매우 빠르게 돌릴 수 있습니다.

### Red-Green-Refactor 사이클

```
1. Red   — Claude가 실패하는 테스트 작성
2. Green — Claude가 테스트를 통과하는 최소 구현
3. Refactor — Claude와 함께 코드 개선
```

실제 대화 예시:

```
> 이메일 유효성 검사 함수 TDD로 구현해줘.
  먼저 테스트 케이스를 작성하고, 테스트가 통과하는 구현을 만들어줘.

Claude: 먼저 테스트를 작성하겠습니다.

// email.test.ts
describe('validateEmail', () => {
  test('유효한 이메일 주소 허용', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user+tag@domain.co.kr')).toBe(true);
  });

  test('유효하지 않은 형식 거부', () => {
    expect(validateEmail('notanemail')).toBe(false);
    expect(validateEmail('@nodomain.com')).toBe(false);
    expect(validateEmail('missing@')).toBe(false);
  });

  test('빈 문자열 거부', () => {
    expect(validateEmail('')).toBe(false);
  });
});

이제 이 테스트를 통과하는 구현을 작성하겠습니다...
```

## 기존 코드에 테스트 추가

이미 작성된 코드에 테스트를 추가할 때:

```
> src/services/order.service.ts 의 calculateDiscount 함수에 대한
  단위 테스트를 작성해줘.
  엣지 케이스 (할인율 0%, 100%, 쿠폰 중복 적용)도 포함해줘.
```

```
> 방금 구현한 API 엔드포인트들에 대한 통합 테스트를 작성해줘.
  supertest 사용하고, 성공 케이스와 실패 케이스 모두 포함해줘.
```

## 테스트 커버리지 올리기

```
> npm test -- --coverage 실행하고 커버리지가 낮은 파일들에
  테스트를 추가해줘. 최소 80% 달성 목표.
```

```
> src/utils/ 디렉토리의 모든 유틸리티 함수에 대한
  테스트 파일이 없는 것들 찾아서 테스트 작성해줘.
```

## 프레임워크별 패턴

### Jest (Node.js/TypeScript)

```
> Jest로 UserService 단위 테스트 작성해줘.
  외부 의존성(DB, 이메일 서비스)은 jest.mock으로 처리해줘.
```

Claude가 생성하는 패턴:

```typescript
import { UserService } from '../services/user.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');

describe('UserService', () => {
  let userService: UserService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    userService = new UserService(mockPrisma);
  });

  describe('findById', () => {
    it('존재하는 사용자를 반환한다', async () => {
      const mockUser = { id: 1, email: 'test@example.com', name: '홍길동' };
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);

      const result = await userService.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('존재하지 않는 사용자는 null을 반환한다', async () => {
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      const result = await userService.findById(999);

      expect(result).toBeNull();
    });
  });
});
```

### Vitest (Vite 생태계)

```
> Vitest로 React 컴포넌트 테스트 작성해줘.
  @testing-library/react 사용해서 사용자 인터랙션 시뮬레이션해줘.
```

### Pytest (Python)

```
> pytest로 FastAPI 엔드포인트 테스트 작성해줘.
  TestClient 사용하고, fixture로 테스트 DB 설정해줘.
```

### Playwright (E2E)

```
> Playwright로 로그인 플로우 E2E 테스트 작성해줘.
  올바른 로그인, 잘못된 비밀번호, 계정 잠금 시나리오 포함해줘.
```

## Hooks와 연동한 자동 테스트

[Hooks 시스템](/docs/level-3/hooks)과 연동하면 파일 저장 시 자동으로 테스트를 실행할 수 있습니다:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npm test -- --passWithNoTests 2>&1 | tail -10"
          }
        ]
      }
    ]
  }
}
```

파일을 수정할 때마다 테스트가 자동 실행되고, 실패하면 Claude가 즉시 수정합니다.

## 실패한 테스트 자동 수정

```
> npm test 실행해서 실패하는 테스트들 모두 수정해줘.
  테스트 자체는 수정하지 말고, 구현 코드만 고쳐줘.
```

```
> 방금 리팩토링 후 깨진 테스트들 고쳐줘.
  테스트가 원래 의도한 동작을 검증하는지 먼저 확인하고,
  구현이 잘못됐으면 구현을 수정해줘.
```

## 테스트 데이터 관리

```
> 테스트용 팩토리 함수 만들어줘.
  User, Order, Product 오브젝트를 쉽게 생성할 수 있게.
  faker.js 사용해서 현실적인 데이터 생성해줘.
```

```typescript
// Claude가 생성하는 팩토리 패턴 예시
import { faker } from '@faker-js/faker';

export const createUser = (overrides = {}) => ({
  id: faker.number.int(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  createdAt: faker.date.recent(),
  ...overrides
});

export const createOrder = (userId: number, overrides = {}) => ({
  id: faker.number.int(),
  userId,
  total: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
  status: 'pending',
  ...overrides
});
```

## 테스트 전략 가이드

Claude Code와 함께하는 테스트 우선순위:

1. **비즈니스 로직** — 계산, 검증, 상태 전환
2. **API 엔드포인트** — 입출력 계약
3. **외부 서비스 연동** — 모킹을 통한 격리
4. **엣지 케이스** — 빈 값, 최대값, 동시성

```
> 이 코드베이스에서 테스트 우선순위를 정해줘.
  비즈니스 로직이 복잡한 부분과 버그가 자주 발생하는 부분 중심으로.
```

### 테스트하지 않아도 되는 것들

- 프레임워크 자체 기능 (Next.js 라우팅 등)
- 단순 getter/setter
- 3줄 이하의 단순 유틸리티

## 테스트 자동화 체크리스트

- [ ] 새 기능 구현 시 테스트 동시 작성
- [ ] 버그 수정 시 회귀 테스트 추가
- [ ] Hooks로 파일 저장 시 테스트 자동 실행 설정
- [ ] CI 파이프라인에 테스트 통합
- [ ] 커버리지 리포트 정기 확인

---

다음 챕터: [CI/CD 통합 →](/docs/level-3/cicd-integration)
