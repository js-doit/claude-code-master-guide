import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HeroSection() {
  return (
    <header className="hero hero--primary" style={{padding: '4rem 0 3rem'}}>
      <div className="container" style={{textAlign: 'center'}}>
        <div style={{fontSize: '3.5rem', marginBottom: '0.5rem'}}>🤖</div>
        <h1 className="hero__title" style={{fontSize: '2.6rem', lineHeight: 1.2}}>
          Claude Code 마스터 가이드
        </h1>
        <p className="hero__subtitle" style={{fontSize: '1.15rem', maxWidth: '600px', margin: '1rem auto 0'}}>
          설치부터 기업 AI 팀 구축까지<br />
          <strong>한국어 완전 정복 플레이북</strong>
        </p>
        <div style={{marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            📖 가이드 시작하기
          </Link>
          <Link className="button button--outline button--secondary button--lg" to="/docs/level-1/what-is-claude-code">
            🚀 Level 1 바로가기
          </Link>
        </div>
      </div>
    </header>
  );
}

function EntryPathSection() {
  return (
    <section style={{padding: '3rem 0', background: 'var(--ifm-background-color)'}}>
      <div className="container">
        <h2 style={{textAlign: 'center', marginBottom: '0.5rem'}}>나에게 맞는 경로 선택하기</h2>
        <p style={{textAlign: 'center', color: 'var(--ifm-color-emphasis-600)', marginBottom: '2.5rem'}}>
          경험 수준에 따라 최적화된 경로로 시작하세요
        </p>
        <div className="entry-cards">
          <Link to="/docs/level-1/what-is-claude-code" className="entry-card">
            <span className="entry-card__emoji">🚀</span>
            <div className="entry-card__title">입문자라면</div>
            <div className="entry-card__desc">
              Claude Code를 처음 접하는 분. 설치부터 첫 번째 AI 코딩 세션까지 차근차근 안내합니다.
            </div>
            <div className="entry-card__cta">레벨 1 — 입문 시작 →</div>
          </Link>

          <Link to="/docs/level-2/claude-md" className="entry-card">
            <span className="entry-card__emoji">🔧</span>
            <div className="entry-card__title">개발자라면</div>
            <div className="entry-card__desc">
              설치는 이미 했거나 빠르게 시작하고 싶은 분. CLAUDE.md, 슬래시 커맨드, Git 연동 등 실전 활용법부터 시작하세요.
            </div>
            <div className="entry-card__cta">레벨 2 — 기초 시작 →</div>
          </Link>

          <Link to="/docs/level-5/intro" className="entry-card">
            <span className="entry-card__emoji">🏢</span>
            <div className="entry-card__title">기업 도입을 검토 중이라면</div>
            <div className="entry-card__desc">
              팀 전체에 AI를 도입하려는 분. 멀티에이전트 아키텍처, ROI 분석, 보안 정책까지 다룹니다.
            </div>
            <div className="entry-card__cta">레벨 5 — 마스터 시작 →</div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function RoadmapSection() {
  const levels = [
    {
      num: '1',
      title: '입문',
      desc: '설치 · API 키 · IDE 연동 · 첫 번째 실행',
      badge: 'beginner',
      link: '/docs/level-1/intro',
    },
    {
      num: '2',
      title: '기초',
      desc: 'CLAUDE.md · 슬래시 커맨드 · Git 연동 · 메모리 시스템',
      badge: 'foundation',
      link: '/docs/level-2/intro',
    },
    {
      num: '3',
      title: '중급',
      desc: 'Hooks · MCP 서버 · 비용 최적화 · CI/CD 통합',
      badge: 'intermediate',
      link: '/docs/level-3/intro',
    },
    {
      num: '4',
      title: '고급',
      desc: '커스텀 스킬 · 에이전트 파이프라인 · 대규모 코드베이스',
      badge: 'advanced',
      link: '/docs/level-4/intro',
    },
    {
      num: '5',
      title: '마스터',
      desc: '멀티에이전트 시스템 · 기업 AI 팀 · 보안 정책',
      badge: 'master',
      link: '/docs/level-5/intro',
    },
  ];

  return (
    <section className="roadmap-section">
      <div className="container">
        <h2 style={{textAlign: 'center', marginBottom: '0.5rem'}}>커리큘럼 로드맵</h2>
        <p style={{textAlign: 'center', color: 'var(--ifm-color-emphasis-600)', marginBottom: '2rem'}}>
          5단계 레벨업 시스템으로 체계적으로 성장하세요
        </p>
        <div className="roadmap-levels">
          {levels.map((level) => (
            <Link key={level.num} to={level.link} style={{textDecoration: 'none'}}>
              <div className="roadmap-level">
                <div className="roadmap-level__num">L{level.num}</div>
                <div className="roadmap-level__info">
                  <h3>
                    <span className={`level-badge level-badge--${level.badge}`}>
                      {level.title}
                    </span>
                  </h3>
                  <p>{level.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section style={{padding: '3rem 0', background: 'var(--ifm-background-color)'}}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          textAlign: 'center',
          maxWidth: '720px',
          margin: '0 auto',
        }}>
          {[
            {num: '5', label: '레벨 커리큘럼'},
            {num: '30+', label: '심화 챕터'},
            {num: '100%', label: '한국어'},
            {num: '무료', label: '전면 공개'},
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--ifm-color-primary)'}}>
                {stat.num}
              </div>
              <div style={{fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-600)'}}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Claude Code 마스터 가이드 — 한국어 완전 정복"
      description="설치부터 기업 AI 팀 구축까지, 한국어로 배우는 Claude Code 완전 정복 플레이북">
      <HeroSection />
      <StatsSection />
      <EntryPathSection />
      <RoadmapSection />
    </Layout>
  );
}
