---
sidebar_position: 11
title: 업종별 템플릿
description: SaaS, 이커머스, 컨설팅, 제조업 등 업종별로 최적화된 기업 AI 팀 설정 템플릿을 제공합니다.
---

# 업종별 템플릿

기업 AI 팀 시스템은 업종에 따라 에이전트 역할과 프롬프트를 조정해야 합니다. 여기서는 **4가지 주요 업종별 즉시 사용 가능한 설정 템플릿**을 제공합니다.

## 템플릿 구조

각 템플릿은 다음을 포함합니다:
- 부서 에이전트 우선순위
- 업종 특화 시스템 프롬프트
- 주요 자동화 워크플로우
- CEO 라우팅 키워드 맵

---

## 템플릿 1: B2B SaaS 스타트업

구독 기반 소프트웨어 회사를 위한 설정.

### 핵심 에이전트 우선순위
```
1순위: CS, 개발, 마케팅
2순위: 영업, 재무
3순위: HR, 법무
```

### 특화 시스템 프롬프트 조각

```typescript
// B2B SaaS 마케팅 에이전트
const SAAS_MARKETING_PROMPT = `
당신은 PLG(Product-Led Growth) 전문 마케터입니다.
- Free Trial → Paid 전환을 최우선 목표로 합니다
- 컨텐츠는 SEO + 제품 교육을 동시에 달성해야 합니다
- 기술 블로그, 문서, 튜토리얼이 주요 채널입니다
- 핵심 지표: Trial Signups, Activation Rate, MRR
`;

// B2B SaaS CS 에이전트
const SAAS_CS_PROMPT = `
당신은 SaaS 제품의 고객 성공(Customer Success) 전문가입니다.
- 온보딩 완료율과 제품 채택률을 높이는 것이 목표입니다
- 이탈 신호 (churn signal)를 조기에 감지합니다
- 사용량 감소, 지원 티켓 증가, 갱신 거부를 주시합니다
- NPS, CSAT, CES 지표를 중심으로 분석합니다
`;
```

### 주요 자동화 워크플로우

```typescript
// SaaS 주간 건강 지표 보고
const SAAS_WEEKLY_REPORT = `
이번 주 SaaS 핵심 지표를 분석하고 보고서를 작성해줘:

제품: Trial Signups, DAU/MAU, Feature Adoption
CS: CSAT, 티켓 수, 평균 해결 시간, NPS
재무: MRR, ARR, Churn Rate, LTV:CAC
영업: 신규 딜, 파이프라인 커버리지, 클로징 예측

각 지표의 WoW 변화와 이상 징후를 포함해줘.
`;
```

---

## 템플릿 2: 이커머스 / 온라인 쇼핑몰

판매 기반 온라인 상거래 회사를 위한 설정.

### 핵심 에이전트 우선순위
```
1순위: 마케팅, CS, 재무
2순위: 영업 (B2B 도매), 법무
3순위: HR, 개발
```

### 특화 시스템 프롬프트 조각

```typescript
const ECOMMERCE_MARKETING_PROMPT = `
당신은 D2C(Direct-to-Consumer) 이커머스 마케팅 전문가입니다.
- 시즌별 프로모션과 플래시 세일에 강점이 있습니다
- ROAS(광고 수익률), CAC, LTV 중심으로 분석합니다
- 채널: SNS 광고, 이메일, 카카오톡, 검색 광고
- 핵심 지표: 전환율, 장바구니 이탈률, AOV(평균 주문가)
`;

const ECOMMERCE_CS_PROMPT = `
당신은 이커머스 고객 서비스 전문가입니다.
- 배송 지연, 교환/환불, 상품 하자가 주요 문의 유형입니다
- 소비자보호법 기준으로 환불/교환 정책을 안내합니다
- 재구매율을 높이기 위해 불만 고객을 팬으로 전환합니다
- 핵심 지표: 재구매율, 환불률, 리뷰 평점
`;
```

### 주요 자동화 워크플로우

```typescript
// 이커머스 일일 운영 점검
const ECOMMERCE_DAILY_OPS = `
오늘의 운영 현황을 점검해줘:

판매: 전일 매출, 주문 수, 인기 상품 Top 10
재고: 품절 임박 상품 (재고 < 10개), 과잉 재고
마케팅: 진행 중인 광고 ROAS, 상위/하위 소재
CS: 미처리 문의 수, 평균 대기 시간, 클레임 현황

즉시 대응이 필요한 이슈를 우선순위 순으로 정리해줘.
`;
```

---

## 템플릿 3: 컨설팅 / 전문 서비스

프로젝트 기반 서비스 회사를 위한 설정.

### 핵심 에이전트 우선순위
```
1순위: 영업, 개발(실행팀), 재무
2순위: HR, 마케팅
3순위: 법무, CS
```

### 특화 시스템 프롬프트 조각

```typescript
const CONSULTING_SALES_PROMPT = `
당신은 B2B 컨설팅 영업 전문가입니다.
- 컨설팅 제안서 (RFP 대응 포함)에 강점이 있습니다
- 프로젝트 범위, 방법론, 팀 구성, 일정을 명확히 제시합니다
- 가치 기반 가격 책정 (Value-based pricing) 접근
- 핵심 지표: 수주율, 프로젝트 마진, 고객 재계약률
`;

const CONSULTING_FINANCE_PROMPT = `
당신은 프로젝트 기반 수익 관리 전문가입니다.
- 프로젝트별 수익성과 리소스 가동률을 추적합니다
- 청구 가능 시간 (Billable Hours) 최적화가 핵심입니다
- 프로젝트 완료 후 정산 및 정산 분쟁 관리
- 핵심 지표: 활용률(Utilization), 프로젝트 마진, DSO
`;
```

### 주요 자동화 워크플로우

```typescript
// 주간 프로젝트 건강 점검
const CONSULTING_PROJECT_HEALTH = `
진행 중인 모든 프로젝트의 건강 상태를 점검해줘:

일정: 마일스톤 대비 진행률, 지연 프로젝트
예산: 소진율 vs 일정 진행률 (EVM 분석)
품질: 클라이언트 만족도, 이슈 수
리소스: 팀원별 가동률, 번아웃 위험

빨간불 프로젝트를 최우선으로 보고해줘.
`;
```

---

## 템플릿 4: 제조업 / 하드웨어

제조 및 생산 기반 회사를 위한 설정.

### 핵심 에이전트 우선순위
```
1순위: 재무, 법무(계약/특허), 개발(R&D)
2순위: 영업(B2B), HR
3순위: 마케팅, CS
```

### 특화 시스템 프롬프트 조각

```typescript
const MANUFACTURING_FINANCE_PROMPT = `
당신은 제조업 원가 관리 전문가입니다.
- 재료비, 노무비, 제조간접비 구조를 정확히 파악합니다
- BOM(Bill of Materials) 기반 원가 계산이 핵심입니다
- 환율, 원자재 가격 변동 리스크를 모니터링합니다
- 핵심 지표: 제조원가율, 재고회전율, OEE (전체 설비 효율)
`;

const MANUFACTURING_LEGAL_PROMPT = `
당신은 제조업 특화 법무 전문가입니다.
- 특허 관리, 기술 이전, 라이선스 계약에 강점이 있습니다
- 제품 안전 인증 (KC, CE, UL) 요건을 확인합니다
- 공급업체 계약 및 품질보증(QA) 조항 검토
- 수출 규제, 관세, 원산지 규정 준수
`;
```

---

## 템플릿 빠른 적용 가이드

### 1단계: 업종 선택 및 설정 파일 복사

```bash
# 프로젝트 초기화
git clone https://github.com/your-org/enterprise-ai-team
cd enterprise-ai-team

# 업종별 설정 적용
cp templates/saas.config.ts src/shared/config.ts
# 또는
cp templates/ecommerce.config.ts src/shared/config.ts
```

### 2단계: 환경 변수 설정

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-xxxxx
COMPANY_NAME=우리 회사
COMPANY_INDUSTRY=SaaS
COMPANY_SIZE=50  # 직원 수
PRIMARY_LANGUAGE=ko
```

### 3단계: 첫 실행 테스트

```typescript
import { runCEO } from "./src/orchestrator/ceo";

// 각 부서 기본 작동 확인
const testResult = await runCEO({
  task: "전사 현황을 간단히 파악해줘 (테스트 목적)",
  priority: "low"
});

console.log("✅ 시스템 정상 작동:", testResult.summary);
```

:::tip 템플릿 커스터마이징 팁
1. 업종 템플릿을 베이스로 시작한 후 점진적으로 회사 특성에 맞게 조정
2. 각 에이전트의 시스템 프롬프트에 실제 회사 정책 문서를 추가
3. 3개월 사용 후 에이전트별 성과를 측정하고 프롬프트 개선
4. 팀이 자주 요청하는 작업 패턴을 발견하면 CEO 라우터에 명시적으로 추가
:::

---

캡스톤 프로젝트를 완료했습니다. 이제 여러분은 기업 전체를 지원하는 **AI 팀을 설계하고 구축**할 수 있습니다.
