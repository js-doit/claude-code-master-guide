// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Claude Code 마스터 가이드',
  tagline: '설치부터 기업 AI 팀 구축까지 — 한국어 완전 정복 플레이북',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://claude-code-master-guide.vercel.app',
  baseUrl: '/',

  organizationName: 'js-doit',
  projectName: 'claude-code-master-guide',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko', 'en'],
    localeConfigs: {
      ko: { label: '한국어', direction: 'ltr', htmlLang: 'ko' },
      en: { label: 'English', direction: 'ltr', htmlLang: 'en' },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/js-doit/claude-code-master-guide/tree/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: false,
        },
        blog: {
          showReadingTime: true,
          blogTitle: '업데이트 소식',
          blogDescription: 'Claude Code 최신 기능 및 가이드 업데이트',
          feedOptions: { type: ['rss', 'atom'], xslt: true },
          editUrl: 'https://github.com/js-doit/claude-code-master-guide/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.jpg',
      metadata: [
        {name: 'keywords', content: 'claude code, AI 코딩, 클로드 코드, AI 에이전트, 개발 자동화'},
        {name: 'og:description', content: '설치부터 기업 AI 팀 구축까지, 한국어 Claude Code 완전 정복 가이드'},
      ],
      colorMode: {
        defaultMode: 'light',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Claude Code 마스터 가이드',
        logo: {
          alt: 'Claude Code 마스터 가이드 로고',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'guideSidebar',
            position: 'left',
            label: '📚 가이드',
          },
          {to: '/blog', label: '🔔 업데이트', position: 'left'},
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/js-doit/claude-code-master-guide',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '가이드',
            items: [
              { label: '🚀 입문 (레벨 1)', to: '/docs/level-1/intro' },
              { label: '🔧 기초 (레벨 2)', to: '/docs/level-2/claude-md' },
              { label: '⚙️ 중급 (레벨 3)', to: '/docs/level-3/hooks' },
              { label: '🛠️ 고급 (레벨 4)', to: '/docs/level-4/custom-skills' },
              { label: '🏆 마스터 (레벨 5)', to: '/docs/level-5/intro' },
            ],
          },
          {
            title: '프로젝트',
            items: [
              { label: '🏢 기업 팀 에이전트 (캡스톤)', to: '/docs/capstone/overview' },
              { label: '📖 빠른 참조', to: '/docs/reference' },
              { label: '❓ FAQ', to: '/docs/faq' },
              { label: '🆕 업데이트 소식', to: '/blog' },
            ],
          },
          {
            title: '더 알아보기',
            items: [
              { label: 'Anthropic 공식 문서', href: 'https://docs.anthropic.com' },
              { label: 'GitHub 저장소', href: 'https://github.com/js-doit/claude-code-master-guide' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Claude Code 마스터 가이드. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'json', 'yaml', 'markdown'],
      },
    }),
};

export default config;
