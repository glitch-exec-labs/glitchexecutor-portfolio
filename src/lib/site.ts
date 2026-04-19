// Single source of truth for brand metadata, nav links, and pricing-free copy.
// Keep this file dependency-free — imported from both server and client code.

export const site = {
  name: 'Glitch Executor',
  parent: 'Glitch Executor',
  domain: 'glitchexecutor.com',
  url: 'https://glitchexecutor.com',
  contactEmail: 'support@glitchexecutor.com',
  tagline: 'AI systems that move money, prices, and signals.',
  description:
    'Glitch Executor builds AI agent systems across trading, sports intelligence, and e-commerce. One team, one stack, three product lines: Glitch Trade, Glitch Edge, Glitch Grow.',
  ogImage: '/assets/brand/og-image.png',
  twitter: '@glitchexecutor',
  locale: 'en-US',
} as const;

export const nav = [
  { href: '/#portfolio',   label: 'Portfolio' },
  { href: '/#how',         label: 'How we work' },
  { href: '/#milestones',  label: 'Milestones' },
  { href: '/#faq',         label: 'FAQ' },
  { href: '/#contact',     label: 'Contact' },
] as const;

export const legalNav = [
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms',   label: 'Terms' },
] as const;

// Sister sites — central source so Nav / Portfolio grid / Footer stay in sync.
export const subBrands = [
  {
    slug: 'trade',
    name: 'Glitch Trade',
    href: 'https://trade.glitchexecutor.com',
    tagline: 'AI trading ensemble across cTrader, MT5, and IB.',
    proof: [
      '8-model ensemble — trend, momentum, mean-reversion, ML, volume, session, MTF, technicals',
      'cTrader Open API, MT5, Interactive Brokers — one execution layer',
      'Telegram client bot with signal alerts, RAG assistant, billing',
    ],
    icon: 'chart' as const,
  },
  {
    slug: 'edge',
    name: 'Glitch Edge',
    href: 'https://edge.glitchexecutor.com',
    tagline: 'Sports intelligence engines for professional bettors.',
    proof: [
      'Pre-match and in-play model stack with edge-aware staking',
      'Private data pipelines — no scraped-odds dependency',
      'Built for high-volume syndicates, not retail tipsters',
    ],
    icon: 'bolt' as const,
  },
  {
    slug: 'grow',
    name: 'Glitch Grow',
    href: 'https://grow.glitchexecutor.com',
    tagline: 'AI digital marketing for DTC and e-commerce.',
    proof: [
      'Cross-platform attribution — Meta, Amazon, Shopify unified',
      'Voice AI for COD confirmation — training data you own',
      'Shopify automation — theme-as-code, multi-store safe',
    ],
    icon: 'shopping-cart' as const,
  },
] as const;

export type NavItem = (typeof nav)[number];
export type SubBrand = (typeof subBrands)[number];
