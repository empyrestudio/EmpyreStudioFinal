export const STATUSES = [
  { id: 'draft', label: 'Draft' },
  { id: 'discovery', label: 'In discovery' },
  { id: 'review', label: 'Ready for review' },
  { id: 'client-ready', label: 'Client-ready' },
  { id: 'archived', label: 'Archived' },
]

export const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.id, s.label]))

export const INDUSTRIES = [
  'Restaurant & Dining',
  'Hospitality & Hotels',
  'Personal Brand',
  'Lifestyle',
  'Professional Services',
  'Retail',
  'Beauty',
  'Wellness',
  'Technology',
  'Creative / Studio',
  'Fashion',
  'Food & Beverage',
  'Real Estate',
  'Other',
]

export const STAGES = [
  { id: 'new', label: 'New venture' },
  { id: 'growing', label: 'Growing business' },
  { id: 'rebrand', label: 'Rebrand' },
  { id: 'launching', label: 'Launching' },
  { id: 'established', label: 'Established brand' },
  { id: 'stewardship', label: 'Ongoing brand management' },
]

export const STAGE_LABEL = Object.fromEntries(STAGES.map((s) => [s.id, s.label]))

export const MODELS = [
  'Service',
  'Product',
  'Hospitality',
  'Hybrid',
  'Subscription',
  'Membership',
  'Marketplace',
  'Other',
]

export const ACTIONS = ['Book', 'Buy', 'Inquire', 'Visit', 'Reserve', 'Subscribe', 'Apply']

export const BUDGETS = [
  'To be determined',
  'Under $8k',
  '$8k–$15k',
  '$15k–$30k',
  '$30k–$60k',
  '$60k+',
  'Retainer interest',
]

export const TIMELINES = [
  '5 days (sprint)',
  '4–6 weeks',
  '8–12 weeks',
  '90 days',
  'Flexible',
]

export const TIERS = {
  sprint: {
    id: 'sprint',
    name: 'Brand Clarity Sprint',
    code: 'SERVICE 01',
    category: 'INTENSIVE · 5 DAYS',
    line: 'Five days. Complete clarity. A foundation you can build everything on.',
    deliverables: [
      'Brand Clarity Map',
      'Brand positioning statement',
      'Audience clarity profile',
      'Competitive landscape analysis',
      'Voice and tone definition',
      'Visual direction brief',
      'Strategic debrief session',
    ],
  },
  identity: {
    id: 'identity',
    name: 'Identity Transformation',
    code: 'SERVICE 02',
    category: 'COMPREHENSIVE IDENTITY',
    line: 'This is not a refresh. This is a transformation.',
    deliverables: [
      'Complete brand strategy and positioning',
      'Primary logo and logo variations',
      'Color palette',
      'Typography system',
      'Graphic language',
      'Voice and tone guidelines',
      'Messaging hierarchy',
      'Tagline',
      'Brand vocabulary',
      'Comprehensive brand guidelines',
      'Production-ready asset suite',
      'Empyré Signature delivery package',
    ],
  },
  launch: {
    id: 'launch',
    name: 'Signature Launch Suite',
    code: 'SERVICE 03',
    category: 'IDENTITY + LAUNCH',
    line: 'From brand to market in one movement.',
    deliverables: [
      'Everything in Identity Transformation',
      'Launch strategy and sequencing plan',
      'Messaging rollout framework',
      'Website creative direction',
      'Social content foundations and templates',
      'Announcement and launch asset suite',
      'Launch debrief session',
    ],
  },
  steward: {
    id: 'steward',
    name: 'Brand Stewardship',
    code: 'SERVICE 04',
    category: 'ONGOING RETAINER',
    line: 'Your brand, sustained. Month after month.',
    deliverables: [
      'Brand oversight and creative direction',
      'Content strategy and campaign direction',
      'Brand consistency review',
      'Monthly strategic review',
      'Ongoing asset and template management',
      'Priority support for emerging needs',
    ],
  },
}

export const TIER_LIST = Object.values(TIERS)

export const SIGNATURE = [
  { n: '01', name: 'Brand Bible', body: 'Strategic foundation, positioning, audience, competitive landscape, brand story, and core truths.' },
  { n: '02', name: 'Identity Guidelines', body: 'Rules for logo, colors, typography, graphic language, and consistent brand application.' },
  { n: '03', name: 'Verbal Playbook', body: 'Voice and tone, messaging hierarchy, writing principles, vocabulary, copy frameworks, and examples.' },
  { n: '04', name: 'Asset Suite', body: 'Production-ready logo files, colors, typography specifications, and assets for digital and print use.' },
  { n: '05', name: 'Launch Toolkit', body: 'Social templates, announcement assets, decks, email signatures, campaign collateral, and launch-ready materials.' },
  { n: '06', name: 'Brand Briefing', body: 'A recorded or narrated walkthrough that enables clients and collaborators to use the brand system properly.' },
]

export const ASSESS_TABS = [
  { id: 'diagnosis', label: '01  Diagnosis' },
  { id: 'clarity', label: '02  Clarity Map' },
  { id: 'tier', label: '03  Recommended Tier' },
  { id: 'directions', label: '04  Directions' },
  { id: 'web', label: '05  Website + UX' },
  { id: 'seo', label: '06  SEO + Content' },
  { id: 'marketing', label: '07  Marketing + Launch' },
  { id: 'roadmap', label: '08  90-Day Roadmap' },
  { id: 'proposal', label: '09  Deliverables' },
  { id: 'notes', label: '10  Internal Notes' },
  { id: 'export', label: 'Export' },
]

export const INTAKE_STEPS = [
  { id: 1, label: 'Foundation' },
  { id: 2, label: 'Audience' },
  { id: 3, label: 'Brand Reality' },
  { id: 4, label: 'Competition' },
  { id: 5, label: 'Goals + Scope' },
  { id: 6, label: 'Files' },
]

export const EMPTY_CLIENT = {
  businessName: '',
  website: '',
  socials: '',
  location: '',
  industry: '',
  businessModel: '',
  primaryOffer: '',
  typicalValue: '',
  stage: '',
  primaryAudience: '',
  secondaryAudience: '',
  motivations: '',
  objections: '',
  painPoints: '',
  desiredAction: '',
  geoMarket: '',
  strengths: '',
  challenges: '',
  unclear: '',
  mustRemain: '',
  voiceDescription: '',
  admiredBrands: '',
  avoidBrands: '',
  currentWebsite: '',
  competitors: '',
  alternatives: '',
  marketPosition: '',
  differentiators: '',
  salesObjections: '',
  customerLanguage: '',
  analytics: '',
  goals: '',
  conversionGoal: '',
  desiredPerception: '',
  timeline: '',
  budget: '',
  preferredService: '',
  requiredDeliverables: '',
  notes: '',
  assets: [],
}

export const EMPTY_NOTES = {
  cdNotes: '',
  risks: '',
  questions: '',
  proposalNotes: '',
  scopeConcerns: '',
  pricingNotes: '',
  followUp: '',
  needsReview: true,
}

export const OWNERS = ['Empyré', 'Client', 'Developer', 'Photographer', 'Copywriter', 'Other']
export const PRIORITIES = ['Critical', 'High', 'Medium']
