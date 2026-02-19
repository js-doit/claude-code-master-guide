import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

/* ─────────────────────────────────────────
   히어로: 터미널 창 + 타이틀
   ───────────────────────────────────────── */
function Hero() {
  return (
    <section className="cc-hero">
      <div className="cc-hero__inner">

        {/* 터미널 창 */}
        <div className="cc-terminal">
          <div className="cc-terminal__titlebar">
            <span className="cc-terminal__dot cc-terminal__dot--red" />
            <span className="cc-terminal__dot cc-terminal__dot--yellow" />
            <span className="cc-terminal__dot cc-terminal__dot--green" />
            <span className="cc-terminal__name">claude — ~/my-project</span>
          </div>
          <div className="cc-terminal__body">
            <div className="cc-terminal__line">
              <span className="cc-terminal__path">~/my-project</span>
              <span className="cc-terminal__prompt">$</span>
              <span className="cc-terminal__cmd">claude</span>
            </div>
            <div className="cc-terminal__line">
              <span className="cc-terminal__output-muted">✻ Welcome to Claude Code!</span>
            </div>
            <div className="cc-terminal__line" style={{marginTop: '0.5rem'}}>
              <span className="cc-terminal__prompt">&gt;</span>
              <span className="cc-terminal__cmd">로그인 기능 추가해줘. JWT + refresh token 방식으로</span>
            </div>
            <div className="cc-terminal__line">
              <span className="cc-terminal__output-muted">⠋ auth/login.ts 분석 중...</span>
            </div>
            <div className="cc-terminal__line">
              <span className="cc-terminal__output-ok">✓ auth/login.ts 생성 완료</span>
            </div>
            <div className="cc-terminal__line">
              <span className="cc-terminal__output-ok">✓ auth/middleware.ts 생성 완료</span>
            </div>
            <div className="cc-terminal__line">
              <span className="cc-terminal__output-ok">✓ tests/auth.test.ts 작성 완료</span>
            </div>
            <div className="cc-terminal__line" style={{marginTop: '0.5rem'}}>
              <span className="cc-terminal__prompt">&gt;</span>
              <span className="cc-terminal__cursor" />
            </div>
          </div>
        </div>

        {/* 뱃지 */}
        <div className="cc-hero__eyebrow">한국어 완전 정복 플레이북</div>

        {/* 타이틀 */}
        <h1 className="cc-hero__title">
          Claude Code를<br />
          <span>제대로 배우는</span> 유일한 곳
        </h1>

        <p className="cc-hero__subtitle">
          설치부터 기업 AI 팀 구축까지<br />
          5단계 커리큘럼으로 체계적으로 완주합니다
        </p>

        {/* CTA */}
        <div className="cc-hero__actions">
          <Link className="cc-btn-primary" to="/docs/level-1/what-is-claude-code">
            지금 시작하기 →
          </Link>
          <Link className="cc-btn-ghost" to="/docs/intro">
            커리큘럼 보기
          </Link>
        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   통계 바
   ───────────────────────────────────────── */
function Stats() {
  const items = [
    { num: '5',   label: '레벨 커리큘럼' },
    { num: '30+', label: '심화 챕터' },
    { num: '100%', label: '한국어' },
    { num: '무료', label: '전면 공개' },
  ];
  return (
    <div className="cc-stats">
      <div className="cc-stats__inner">
        {items.map((s) => (
          <div key={s.label} className="cc-stat">
            <div className="cc-stat__num">{s.num}</div>
            <div className="cc-stat__label">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   진입 경로
   ───────────────────────────────────────── */
function Paths() {
  const cards = [
    {
      icon: '🚀',
      title: '입문자',
      desc: 'Claude Code가 처음인 분. 설치, API 키 설정, 첫 번째 AI 코딩 세션까지 차근차근 안내합니다.',
      cta: 'Level 1 — 입문 시작하기',
      to: '/docs/level-1/what-is-claude-code',
    },
    {
      icon: '⚡',
      title: '현직 개발자',
      desc: '설치는 건너뛰고 실전부터. CLAUDE.md, 슬래시 커맨드, Git 연동, 컨텍스트 관리 등 핵심 워크플로우.',
      cta: 'Level 2 — 기초 시작하기',
      to: '/docs/level-2/claude-md',
    },
    {
      icon: '🏢',
      title: '기업 도입 담당자',
      desc: '팀 전체에 AI를 도입하려는 분. 멀티에이전트 아키텍처, 보안 정책, ROI 분석까지 다룹니다.',
      cta: 'Level 5 — 마스터 시작하기',
      to: '/docs/level-5/intro',
    },
  ];

  return (
    <section className="cc-paths">
      <div className="container">
        <p className="cc-section-label">나에게 맞는 경로</p>
        <h2 className="cc-section-title">어디서든 시작할 수 있습니다</h2>
        <p className="cc-section-desc">
          경험 수준에 맞는 시작점을 선택하세요
        </p>
        <div className="cc-path-cards">
          {cards.map((c) => (
            <Link key={c.title} to={c.to} className="cc-path-card">
              <div className="cc-path-card__icon">{c.icon}</div>
              <div className="cc-path-card__title">{c.title}</div>
              <div className="cc-path-card__desc">{c.desc}</div>
              <div className="cc-path-card__cta">{c.cta} →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   커리큘럼 로드맵
   ───────────────────────────────────────── */
function Roadmap() {
  const levels = [
    {
      num: 'L1', badge: 'L1', badgeClass: 'badge--l1',
      title: '입문',
      desc: '설치 · API 키 · IDE 연동 · 첫 실행 · 기본 명령어',
      to: '/docs/level-1/intro',
    },
    {
      num: 'L2', badge: 'L2', badgeClass: 'badge--l2',
      title: '기초',
      desc: 'CLAUDE.md · 슬래시 커맨드 · Git · 메모리 시스템',
      to: '/docs/level-2/intro',
    },
    {
      num: 'L3', badge: 'L3', badgeClass: 'badge--l3',
      title: '중급',
      desc: 'Hooks · MCP 서버 · 비용 최적화 · CI/CD',
      to: '/docs/level-3/intro',
    },
    {
      num: 'L4', badge: 'L4', badgeClass: 'badge--l4',
      title: '고급',
      desc: '커스텀 스킬 · Agent SDK · 대규모 코드베이스',
      to: '/docs/level-4/intro',
    },
    {
      num: 'L5', badge: 'L5', badgeClass: 'badge--l5',
      title: '마스터',
      desc: '멀티에이전트 · 기업 AI 팀 · 보안 정책',
      to: '/docs/level-5/intro',
    },
  ];

  return (
    <section className="cc-roadmap">
      <div className="container">
        <p className="cc-section-label">커리큘럼</p>
        <h2 className="cc-section-title">5단계 레벨업 시스템</h2>
        <p className="cc-section-desc">
          체계적인 순서로 학습해도 좋고, 필요한 챕터만 골라 읽어도 됩니다
        </p>
        <div className="cc-roadmap__grid">
          {levels.map((l) => (
            <Link key={l.num} to={l.to} className="cc-roadmap__item">
              <div className="cc-roadmap__num">{l.num}</div>
              <div className={`cc-roadmap__badge ${l.badgeClass}`}>{l.title}</div>
              <div className="cc-roadmap__desc">{l.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   페이지 조합
   ───────────────────────────────────────── */
export default function Home() {
  return (
    <Layout
      title="Claude Code 마스터 가이드 — 한국어 완전 정복"
      description="설치부터 기업 AI 팀 구축까지, 한국어로 배우는 Claude Code 완전 정복 플레이북">
      <Hero />
      <Stats />
      <Paths />
      <Roadmap />
    </Layout>
  );
}
