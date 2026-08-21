import { TIERS } from './constants.js'
import { filled, clean, nameOf, industryOf, offerOf, audienceOf, placeOf, actionOf, completeness, firstWord } from './utils.js'

const hyp = (text) => ({ text, source: 'hypothesis' })
const fact = (text) => ({ text, source: 'client' })

function line(client, key, fallback) {
  return filled(client[key]) ? fact(clean(client[key])) : hyp(fallback)
}

function joinList(s) {
  if (!filled(s)) return []
  return s.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean)
}

function confidenceFrom(client, gaps) {
  const { score } = completeness(client)
  if (score >= 75 && gaps.length <= 2) return 'High'
  if (score >= 45) return 'Medium'
  return 'Low'
}

function stageId(client) {
  return client.stage || ''
}

function isLaunchy(client) {
  const s = stageId(client)
  const blob = `${client.goals || ''} ${client.unclear || ''} ${client.challenges || ''} ${client.requiredDeliverables || ''}`.toLowerCase()
  return s === 'launching' || s === 'new' || /launch|relaunch|open|announce|go.to.market|gtm/.test(blob)
}

function identityBroken(client) {
  const blob = `${client.challenges || ''} ${client.unclear || ''} ${client.notes || ''}`.toLowerCase()
  return /logo|visual|outdated|inconsistent|identity|looks cheap|diy|canva|unprofessional|doesn't look|does not look|website/.test(blob)
}

function clarityBroken(client) {
  const blob = `${client.challenges || ''} ${client.unclear || ''} ${client.voiceDescription || ''} ${client.marketPosition || ''}`.toLowerCase()
  const missingCore = !filled(client.primaryAudience) || !filled(client.differentiators) || !filled(client.marketPosition)
  return missingCore || /position|message|who we are|confus|unclear|voice|differentiate|same as/.test(blob)
}

function foundationSound(client) {
  const s = stageId(client)
  const blob = `${client.strengths || ''} ${client.challenges || ''}`.toLowerCase()
  return s === 'stewardship' || (s === 'established' && /consistent|guidelines|system|recognized/.test(blob) && !identityBroken(client))
}

export function recommendTier(client) {
  const launch = isLaunchy(client)
  const identity = identityBroken(client)
  const clarity = clarityBroken(client)
  const sound = foundationSound(client)
  const s = stageId(client)
  const preferred = clean(client.preferredService).toLowerCase()

  let id = 'identity'
  let whyPref = ''

  if (s === 'stewardship' || sound) {
    id = 'steward'
  } else if (s === 'launching' || (launch && (identity || s === 'new' || s === 'rebrand'))) {
    id = 'launch'
  } else if (s === 'new' && clarity && !identity) {
    id = 'sprint'
  } else if (clarity && !identity && s !== 'rebrand') {
    id = 'sprint'
  } else if (s === 'rebrand' || identity) {
    id = 'identity'
  } else if (s === 'growing' && identity) {
    id = 'identity'
  } else if (s === 'established' && identity) {
    id = 'identity'
  } else if (s === 'established' && !identity && !clarity) {
    id = 'steward'
  }

  if (preferred.includes('sprint')) { id = 'sprint'; whyPref = 'Client indicated a preference for Brand Clarity Sprint. Confirm scope against the diagnosis before locking the proposal.' }
  if (preferred.includes('identity') || preferred.includes('transformation')) { id = 'identity'; whyPref = 'Client indicated a preference for Identity Transformation. Confirm they have enough strategic clarity to brief the identity, or pair with a short clarity phase.' }
  if (preferred.includes('launch') || preferred.includes('signature')) { id = 'launch'; whyPref = 'Client indicated a preference for Signature Launch Suite. Confirm a true go-to-market moment exists.' }
  if (preferred.includes('steward')) { id = 'steward'; whyPref = 'Client indicated Brand Stewardship. Only proceed if a usable brand system already exists; otherwise begin with identity or clarity.' }

  const tier = TIERS[id]
  const others = {
    sprint: 'A sprint solves articulation. It does not produce a complete identity system, production-ready assets, or a coordinated launch.',
    identity: 'Identity Transformation builds the system. It is heavier than needed if the only gap is language, and lighter than needed if the brand must enter market with a full launch sequence.',
    launch: 'Signature Launch Suite is warranted when the brand must move from system to market in one movement. It is premature if positioning is still unsolved or if the identity foundation is already sound and only needs stewardship.',
    steward: 'Brand Stewardship sustains a working system. It is the wrong first step if the brand still lacks positioning, a coherent identity, or a launch expression.',
  }

  const problem = {
    sprint: 'The business is ahead of its language. Decisions are being made without a shared positioning, audience, or voice — so visual work would be decorative rather than strategic.',
    identity: 'The offer is real, but the brand does not yet behave as one system. Strategy, identity, and language need to be rebuilt together so the business can be recognized, trusted, and chosen.',
    launch: 'This is not only an identity problem. The brand is entering or re-entering market and needs a coordinated expression — identity, site direction, announcement, and first-wave content — in one movement.',
    steward: 'The foundation is usable. The risk now is drift: campaigns, content, and collaborators will dilute the brand unless it has an embedded creative director.',
  }

  return {
    id,
    name: tier.name,
    code: tier.code,
    category: tier.category,
    line: tier.line,
    deliverables: [...tier.deliverables],
    why: problem[id],
    whyOthers: Object.entries(others)
      .filter(([k]) => k !== id)
      .map(([k, v]) => ({ name: TIERS[k].name, reason: v })),
    preferenceNote: whyPref,
    futurePhase:
      id === 'sprint'
        ? 'After the sprint: Identity Transformation if the visual system is the constraint; Signature Launch Suite if a market moment is imminent.'
        : id === 'identity'
          ? 'After identity: Signature Launch Suite if a public relaunch is required; Brand Stewardship to protect the system in market.'
          : id === 'launch'
            ? 'After launch: Brand Stewardship to hold standard through the first 90 days of live content and campaigns.'
            : 'If discovery reveals the foundation is weaker than assumed, pause stewardship and open an Identity Transformation or Clarity Sprint.',
  }
}

const ARCHETYPES = [
  {
    id: 'standard',
    territory: 'Quiet Authority',
    industries: ['Professional Services', 'Real Estate', 'Technology', 'Creative / Studio', 'Hospitality & Hotels', 'Fashion', 'Other'],
    name: (c) => `The ${firstWord(nameOf(c))} Standard`,
    concept: (c) => `${nameOf(c)} as the reference point in ${industryOf(c)} — the brand others are measured against, not the one competing for attention.`,
    signal: 'Category authority. Precision over performance. The house that sets the bar.',
    emotion: 'Respect, certainty, relief at having found the serious option.',
    fit: 'Clients who buy on judgment, reputation, and long-term confidence rather than novelty.',
    risk: 'Can read as distant if warmth, hospitality, or human proof is required to convert. Must be earned with evidence, not posture.',
    personality: { formal: 78, progressive: 42, expressive: 28, exclusive: 72, aspirational: 64 },
    voice: 'Declarative. Short sentences. Specific nouns. No hype, no therapy-speak, no “we’re passionate.”',
    use: ['standard', 'precise', 'measured', 'considered', 'held', 'clear', 'rigor', 'judgment', 'quiet', 'exact'],
    avoid: ['passionate', 'disrupt', 'synergy', 'unlock', 'magic', 'family-owned as a substitute for proof', 'luxury (undefined)', 'elevate (undefined)'],
    logo: {
      type: 'Custom typographic wordmark with an optional structural monogram',
      logic: 'Construct from proportion, not ornament. A single optical correction that becomes recognizable at small sizes. The monogram, if used, should feel architectural — a mark you could cast in metal.',
      cues: 'High-contrast or precisely drawn sans/serif hybrid. Restrained ligature or custom É-like accent only if it serves recognition. Generous tracking in the wordmark; never cramped.',
      uses: 'Legal documents, site header, signage, proposal covers, wayfinding, app icons via monogram.',
      avoid: 'Gradients, icons of the industry cliché, script, faux-heritage crests, decorative flourishes.',
    },
    palette: [
      { name: 'Void Ink', hex: '#121417', role: 'Primary ground', rationale: 'Authority without theatrical black.', a11y: 'Use only with Bone or brighter text. Contrast vs Bone exceeds 4.5:1.' },
      { name: 'Bone', hex: '#EFE8DC', role: 'Primary paper / text on ink', rationale: 'Warm neutrality; avoids sterile white.', a11y: 'Text on Void Ink is WCAG AA. Do not set Bone text on Clay.' },
      { name: 'Stone', hex: '#8A847A', role: 'Secondary / captions', rationale: 'Quiet hierarchy.', a11y: 'Stone on Void Ink is large-text only (3:1). Not for body copy.' },
      { name: 'Gilt', hex: '#B08A5A', role: 'Accent — rules, active states', rationale: 'Warm metal, not “gold luxury.” Use as a line, never a fill field.', a11y: 'Do not use Gilt for small text on Bone or Ink. Accent only.' },
      { name: 'Lead', hex: '#3A3E44', role: 'UI panels, rules', rationale: 'Structural gray.', a11y: 'Bone text on Lead meets large-text contrast; verify body.' },
      { name: 'Chalk', hex: '#F7F4EE', role: 'Light surfaces', rationale: 'Print and light-mode web.', a11y: 'Void Ink on Chalk exceeds 4.5:1.' },
    ],
    type: {
      display: 'Editorial serif with real italics — Newsreader or Cormorant Garamond. Display is for headlines, never long body.',
      body: 'Humanist sans with open counters — Source Sans 3 or Outfit. High readability at 16–18px.',
      ui: 'The body sans at 12–14px, or IBM Plex Sans for data, captions, navigation.',
      hierarchy: 'One display size for page titles. One sans for everything else. No third decorative face. Tracking + letterspacing used as emphasis instead of extra weights.',
      examples: 'Display: Newsreader / Cormorant Garamond. Body: Source Sans 3. UI: IBM Plex Sans. All openly licensed.',
    },
    graphic: 'Hairline rules. Architectural grids. Wide margins. Occasional metal/stone still life. No patterns. Motion: slow fade, no bounce.',
    photo: {
      subject: 'Materials, rooms, hands at work, unsmiling portraits, the product in honest light. Empty space as a feature.',
      lighting: 'North light or controlled tungsten. No ring light, no HDR.',
      composition: 'Centered or classic thirds. Horizon kept true. Crop for stillness.',
      avoid: 'Stock handshakes, confetti, fake “hustle,” over-graded teal-and-orange, lifestyle clichés of the category.',
    },
  },
  {
    id: 'atelier',
    territory: 'The Crafted House',
    industries: ['Restaurant & Dining', 'Beauty', 'Wellness', 'Fashion', 'Creative / Studio', 'Lifestyle', 'Food & Beverage', 'Personal Brand', 'Retail'],
    name: (c) => `Maison ${firstWord(nameOf(c))}`,
    concept: (c) => `${nameOf(c)} as a house of craft — provenance you can feel, skill you can name, hospitality without theatrics.`,
    signal: 'Made by people who know. Warmth with standards. The opposite of scaled anonymity.',
    emotion: 'Trust in the hand. Desire to belong to something carefully made.',
    fit: 'Guests and clients who pay for origin, method, and the feeling of being personally received.',
    risk: 'Can drift into rustic cliché or “small-batch” language that every competitor already uses. Craft must be evidenced, not claimed.',
    personality: { formal: 48, progressive: 46, expressive: 55, exclusive: 58, aspirational: 70 },
    voice: 'Intimate and specific. Sensory where it is true. Names of methods, places, people. Never cute, never farm-wash.',
    use: ['house', 'method', 'hand', 'course', 'room', 'cut', 'grain', 'host', 'kept', 'season'],
    avoid: ['artisan (unsupported)', 'farm-to-table as a slogan', 'passionate', 'hidden gem', 'foodie', 'self-care', 'vibe'],
    logo: {
      type: 'Combination mark: refined wordmark + a single tool, initial, or material-derived symbol',
      logic: 'The symbol should come from a real object in the craft — a blade profile, a vessel, a stitch, a stem — reduced until it is almost abstract. Not an illustration of the product.',
      cues: 'Slightly softer geometry than The Standard. Optional small-cap wordmark. A mark that works embroidered, foiled, and stamped.',
      uses: 'Menus, packaging, uniforms, wax/seal moments, social avatar, door glass.',
      avoid: 'Script that cannot be read at 16px, botanical clip-art, vintage badges with fake establishment dates.',
    },
    palette: [
      { name: 'Ink Walnut', hex: '#2A221C', role: 'Primary ground', rationale: 'Dark without going funeral-black.', a11y: 'Ivory text on Ink Walnut exceeds 4.5:1.' },
      { name: 'Ivory', hex: '#F3EBDD', role: 'Paper / body on dark', rationale: 'Tactile light.', a11y: 'Ink Walnut on Ivory exceeds 4.5:1.' },
      { name: 'Clay', hex: '#B48462', role: 'Primary accent', rationale: 'Fired earth; hospitality warmth.', a11y: 'Clay is not a text color on Ivory. Large headings only on Ink Walnut after checking 3:1.' },
      { name: 'Oxblood', hex: '#6E2E2A', role: 'Secondary accent, rare', rationale: 'Depth for packaging and night menus.', a11y: 'Ivory on Oxblood is acceptable for large type; verify body.' },
      { name: 'Olive Ash', hex: '#6E6A55', role: 'Supporting', rationale: 'Botanical without “spa green.”', a11y: 'Not for small text on Ivory.' },
      { name: 'Raw Linen', hex: '#E7DCC8', role: 'Secondary paper', rationale: 'Print interiors, bags, napkins.', a11y: 'Ink Walnut on Raw Linen meets AA for body.' },
    ],
    type: {
      display: 'Old-style serif with a living italic — Fraunces or Libre Baskerville.',
      body: 'Soft grotesque or humanist sans — Figtree or Source Sans 3.',
      ui: 'Same sans, medium weight, for menus, buttons, captions.',
      hierarchy: 'Italics carry warmth. Caps + tracking for section titles. Avoid novelty scripts in UI.',
      examples: 'Display: Fraunces. Body: Figtree. Captions: Source Serif 4 italic. All openly licensed.',
    },
    graphic: 'Deckled or torn-edge frames used rarely. Pressed-material textures at 8–12% opacity. Corner brackets. Menu-like lists. Motion: gentle rise.',
    photo: {
      subject: 'Process, ingredients or materials before they become the offer, rooms between services, real staff, steam, grain, cloth.',
      lighting: 'Window light. Available dusk. Minimal fill.',
      composition: 'Closer than The Standard. Hands in frame. 4:5 for social. Leave quiet margins.',
      avoid: 'Overhead flat-lays that look like every other brand. Fake flour dust. Stock “chef plating.” Excessive film grain.',
    },
  },
  {
    id: 'signal',
    territory: 'The Living Signal',
    industries: ['Technology', 'Fashion', 'Lifestyle', 'Personal Brand', 'Creative / Studio', 'Retail', 'Beauty', 'Other'],
    name: (c) => `${firstWord(nameOf(c))} Signal`,
    concept: (c) => `${nameOf(c)} as a cultural marker — clearly of this moment, built to remain legible after the moment passes.`,
    signal: 'Contemporary without trend-chasing. Distinctive silhouette. A brand people recognize in the feed and in the room.',
    emotion: 'Aliveness, taste, the feeling of being early without being experimental for its own sake.',
    fit: 'Audiences who choose with cultural literacy — fashion, media, product, personal brands, progressive hospitality.',
    risk: 'Dates quickly if the system leans on a current visual trend (glass, chrome-for-chrome’s-sake, brutalist overload). Distinction must come from structure, not costume.',
    personality: { formal: 35, progressive: 82, expressive: 74, exclusive: 60, aspirational: 68 },
    voice: 'Confident, current, concrete. Cultural references only when they are native. Wit allowed; slang on a leash.',
    use: ['now', 'form', 'line', 'cut', 'signal', 'presence', 'move', 'cast', 'edit', 'hold'],
    avoid: ['disrupt', 'next-gen', 'ecosystem', 'guru', 'fire', 'iconic (self-applied)', 'content (as a noun for the work)'],
    logo: {
      type: 'Custom wordmark or letterform system with a geometric symbol that can animate',
      logic: 'Build a letter or loop that has a single memorable cut. The symbol should work as a favicon, a stamp, and a piece of spatial design. Think sculpture, not sticker.',
      cues: 'Tight optical rhythm. Possible contrast between a severe sans and a single unexpected curve. Capable of motion (draw-on, rotate) without becoming a logo animation for its own sake.',
      uses: 'Digital-first, campaign lockups, merch, spatial installations, profile marks.',
      avoid: 'Copying category “tech” globes, gradients as identity, variable-font gimmicks that fail in print.',
    },
    palette: [
      { name: 'Night Field', hex: '#0B1220', role: 'Primary ground', rationale: 'From Empyré-adjacent atmosphere: depth, not gimmick. Recolor per client — this is a territory, not a studio clone.', a11y: 'Cloud text on Night Field exceeds 4.5:1.' },
      { name: 'Cloud', hex: '#D5DCE6', role: 'Primary text on night', rationale: 'Cool light.', a11y: 'Night Field on Cloud exceeds 4.5:1.' },
      { name: 'Horizon', hex: '#C4A07A', role: 'Accent', rationale: 'A single warm signal against cool night. Use sparingly.', a11y: 'Accent only. Not body text.' },
      { name: 'Chrome', hex: '#9AA7B5', role: 'Secondary metal', rationale: 'Industrial light.', a11y: 'Chrome on Night Field is large-text only.' },
      { name: 'Dusk', hex: '#243044', role: 'Panels, cards', rationale: 'Elevation without extra borders.', a11y: 'Cloud on Dusk should be checked; prefer 18px+.' },
      { name: 'Flare', hex: '#E8C9A0', role: 'Highlight / hover', rationale: 'Warm edge.', a11y: 'Not for small text on Cloud.' },
    ],
    type: {
      display: 'Sharp grotesque or contemporary serif with bite — Syne, Instrument Serif, or Fraunces in high optical size.',
      body: 'Neutral grotesque — Manrope or Outfit.',
      ui: 'The body grotesque, with mono (IBM Plex Mono) for data, codes, release notes.',
      hierarchy: 'Large display, then a hard drop to body. Avoid a mush of mid-sizes. Allow overlap and crop in campaign, not in UI.',
      examples: 'Display: Syne or Instrument Serif. Body: Manrope. Mono: IBM Plex Mono. All openly licensed.',
    },
    graphic: 'Sculptural linework. Overlap. Controlled chrome/metal stills if relevant to the offer — never as decoration. Asymmetric crops. Motion: precise, mechanical, short.',
    photo: {
      subject: 'Silhouette, architecture, garment or product as object, night interiors, sky, one human figure maximum.',
      lighting: 'Hard rim or twilight. High contrast. Color held back.',
      composition: 'Unexpected crop. Vertical dominance. Negative space as a field, not a leftover.',
      avoid: 'Generic neon. Crypto-aesthetic. Trend filters. Crowded lifestyle groups.',
    },
  },
  {
    id: 'threshold',
    territory: 'The Threshold',
    industries: ['Hospitality & Hotels', 'Restaurant & Dining', 'Retail', 'Wellness', 'Real Estate', 'Lifestyle'],
    name: (c) => `Crossing ${firstWord(nameOf(c))}`,
    concept: (c) => `${nameOf(c)} as an arrival — the brand is the moment someone crosses from the ordinary world into a held experience.`,
    signal: 'Hospitality as design. Sequence, ceremony, and place. Not a logo on a building — a building that behaves like a brand.',
    emotion: 'Anticipation, welcome without performance, the sense that someone prepared the room.',
    fit: 'Restaurants, hotels, retail, clinics, and spaces where the conversion is a visit, reservation, or stay.',
    risk: 'Can become generic “experience” language. The threshold must be described as a real sequence (door, greeting, first object, first sentence), not as vibe.',
    personality: { formal: 58, progressive: 52, expressive: 48, exclusive: 62, aspirational: 74 },
    voice: 'Host voice. Second person allowed. Concrete spatial language. Calm tempo.',
    use: ['arrive', 'room', 'table', 'threshold', 'held', 'evening', 'stay', 'course', 'open', 'return'],
    avoid: ['experience (unsupported)', 'journey', 'oasis', 'escape', 'treat yourself', 'hidden gem'],
    logo: {
      type: 'Emblem or combination mark that can live on a door, a matchbox, and a wayfinding system',
      logic: 'Design for physical first: foil, paint, metal, napkins. The mark should have a clear inside/outside — a shape that feels like a passage.',
      cues: 'Arch, interval, or monogram contained in a quiet frame. Not a crest unless the history is real and documented.',
      uses: 'Signage, menus, key cards, uniforms, bookings page, reservations email.',
      avoid: 'Script that dies on a window at 20 meters. Fake heraldry. Over-ornamented monograms.',
    },
    palette: [
      { name: 'Evening', hex: '#1C1A17', role: 'Night interiors / digital ground', rationale: 'Warm dark.', a11y: 'Candle text on Evening exceeds 4.5:1.' },
      { name: 'Candle', hex: '#F0E6D4', role: 'Light text / print paper', rationale: 'Lamp warmth.', a11y: 'Evening on Candle exceeds 4.5:1.' },
      { name: 'Brass', hex: '#C6A36A', role: 'Hardware accent', rationale: 'Physical fittings and digital hover.', a11y: 'Accent only.' },
      { name: 'Umber', hex: '#6A4A32', role: 'Secondary', rationale: 'Wood, leather, soil.', a11y: 'Candle on Umber: large text after check.' },
      { name: 'Sage Plaster', hex: '#A3A392', role: 'Walls / supporting', rationale: 'Interior calm.', a11y: 'Not body text on Candle.' },
      { name: 'Soot', hex: '#3B3833', role: 'UI chrome', rationale: 'Quiet structure.', a11y: 'Candle on Soot for large UI labels.' },
    ],
    type: {
      display: 'Transitional serif — Libre Baskerville or Newsreader.',
      body: 'Humanist sans — Source Sans 3.',
      ui: 'Same sans for booking flows; high clarity on forms is non-negotiable.',
      hierarchy: 'Display for the name of the place and the evening. Sans for wayfinding, menus, and conversion.',
      examples: 'Display: Libre Baskerville. Body/UI: Source Sans 3. All openly licensed.',
    },
    graphic: 'Frames like doorways. Interval patterns (not busy). Numbered sequences. Map-like linework of the room or property when true.',
    photo: {
      subject: 'Thresholds: doors, tables before service, light on a wall, a made bed, a street approach, a host’s hands.',
      lighting: 'Golden hour and practicals. Respect real interior lighting design.',
      composition: 'Eye-level arrival shots. 16:9 for site heroes; 4:5 for rooms.',
      avoid: 'Empty dining rooms that look closed. Wide-angle distortion. Influencer posing.',
    },
  },
  {
    id: 'ritual',
    territory: 'The Daily Ritual',
    industries: ['Beauty', 'Wellness', 'Food & Beverage', 'Lifestyle', 'Retail', 'Personal Brand'],
    name: (c) => `Ritual of ${firstWord(nameOf(c))}`,
    concept: (c) => `${nameOf(c)} as a practice people return to — not a treat, not a trend, a standard they keep with themselves.`,
    signal: 'Repetition with meaning. Care without spa cliché. A brand that belongs in the morning and at night.',
    emotion: 'Calm competence. Devotion. The relief of a simple, excellent routine.',
    fit: 'Beauty, wellness, beverage, objects of daily use, personal brands built on practice rather than personality stunts.',
    risk: 'The category is crowded with moons, women-in-linen, and the word “ritual.” The brand must name a specific practice, not borrow spiritual atmosphere.',
    personality: { formal: 40, progressive: 58, expressive: 50, exclusive: 54, aspirational: 72 },
    voice: 'Even, physical, instructional when useful. Second person for ritual steps. No guru voice.',
    use: ['practice', 'return', 'apply', 'morning', 'measure', 'skin', 'cup', 'keep', 'again', 'still'],
    avoid: ['self-care', 'empower', 'goddess', 'holistic (undefined)', 'toxic', 'wellness-wash', 'namaste'],
    logo: {
      type: 'Wordmark with a simple cyclic or vessel symbol',
      logic: 'A circle is not enough. Derive the symbol from a real repeated action (pour, press, stroke, open) reduced to a line.',
      cues: 'Soft geometry. Thin-to-thick stroke. Works as a stamp on packaging and as a quiet app icon.',
      uses: 'Packaging, instruction leaflets, social, product detail pages.',
      avoid: 'Mandala noise, moons and stars, fake alchemical seals.',
    },
    palette: [
      { name: 'Pumice', hex: '#E7E1D8', role: 'Primary light ground', rationale: 'Mineral, not beige-for-beige.', a11y: 'Charcoal on Pumice exceeds 4.5:1.' },
      { name: 'Charcoal', hex: '#2C2A28', role: 'Text / dark ground', rationale: 'Soft black.', a11y: 'Pumice on Charcoal exceeds 4.5:1.' },
      { name: 'Iron Red', hex: '#8F3D32', role: 'Accent', rationale: 'Body, clay, pigment — not “wellness blush.”', a11y: 'Accent. Large type only on Pumice after check.' },
      { name: 'Moss', hex: '#5B6554', role: 'Secondary', rationale: 'Plant as material, not spa branding.', a11y: 'Pumice on Moss for large labels.' },
      { name: 'Milk', hex: '#F6F1EA', role: 'Highlight paper', rationale: 'Ceramic.', a11y: 'Charcoal on Milk exceeds AA.' },
      { name: 'Smoke', hex: '#9A948C', role: 'Captions', rationale: 'Quiet hierarchy.', a11y: 'Smoke on Milk is large-text only.' },
    ],
    type: {
      display: 'Soft serif — Cormorant Garamond or Fraunces light.',
      body: 'Quiet sans — Outfit or Figtree.',
      ui: 'Sans for instruction steps and e‑commerce. Numbered steps always in sans.',
      hierarchy: 'Display for the name of the practice. Sans for how to do it. Do not set rituals in script.',
      examples: 'Display: Cormorant Garamond. Body: Outfit. All openly licensed.',
    },
    graphic: 'Step diagrams. Circular intervals. Thin rules. Unused space. Packaging dielines as a graphic motif when honest.',
    photo: {
      subject: 'Hands performing the real action. Water, cloth, vessel, product in use — not hovering over marble.',
      lighting: 'Morning side light. Honest skin. No poreless plastic retouching.',
      composition: 'Close, sequential, documentary. Series over hero shots.',
      avoid: 'Crystal bowls, smoke, anonymous linen-clad backs, exaggerated skin smoothing.',
    },
  },
  {
    id: 'essence',
    territory: 'The Essential Cut',
    industries: ['Technology', 'Professional Services', 'Retail', 'Creative / Studio', 'Fashion', 'Other'],
    name: (c) => `${firstWord(nameOf(c))}, Reduced`,
    concept: (c) => `${nameOf(c)} stripped to what is true and useful — fewer messages, fewer surfaces, a sharper offer.`,
    signal: 'Reduction as intelligence. Function made visible. The brand that removes noise rather than adding atmosphere.',
    emotion: 'Clarity, speed of understanding, respect for the visitor’s time.',
    fit: 'Product, software, services, and retailers whose advantage is a cleaner offer than the category default.',
    risk: 'Can be mistaken for generic “minimalism.” Reduction must reveal a point of view, not an absence of one.',
    personality: { formal: 55, progressive: 70, expressive: 22, exclusive: 48, aspirational: 40 },
    voice: 'Plain. Exact. Verbs over adjectives. If a sentence cannot be proven, it is cut.',
    use: ['only', 'need', 'does', 'cut', 'clear', 'enough', 'direct', 'use', 'true', 'stop'],
    avoid: ['minimalist (as a personality)', 'seamless', 'simple (unsupported)', 'easy', 'just', 'clean (undefined)'],
    logo: {
      type: 'Severe wordmark. No symbol unless a genuine functional diagram exists.',
      logic: 'Letterspacing and weight do the work. If a mark is required, it should be a diagram of the offer — a cut, a path, a module — not a decorative initial.',
      cues: 'Grotesque, optically even. Possible single custom letter. Works in system fonts as a last resort, but should still feel intended.',
      uses: 'Product UI, docs, packaging one-color print, GitHub/docs if relevant, wayfinding.',
      avoid: 'Abstract geometry with no meaning. Thin hairline logos that vanish on mobile. Color as the only identity.',
    },
    palette: [
      { name: 'Paper', hex: '#F5F3EF', role: 'Primary ground', rationale: 'Working light.', a11y: 'Ink on Paper exceeds 4.5:1.' },
      { name: 'Ink', hex: '#161616', role: 'Text', rationale: 'True black avoided to reduce glare; still dense.', a11y: 'Paper on Ink exceeds 4.5:1.' },
      { name: 'Rule', hex: '#D8D3CB', role: 'Lines / hairlines', rationale: 'Structure.', a11y: 'Not text.' },
      { name: 'Note', hex: '#2F5D50', role: 'Accent / links / success', rationale: 'Function color, not decoration. One semantic accent only.', a11y: 'Note on Paper should be checked for body; use 700 weight if needed.' },
      { name: 'Warning', hex: '#8A3B2A', role: 'Error / critical UI', rationale: 'Meaning, never mood.', a11y: 'Do not rely on color alone; pair with text/icon.' },
      { name: 'Mid', hex: '#6B6862', role: 'Secondary text', rationale: 'Captions.', a11y: 'Mid on Paper is large-text / captions; not small legal copy.' },
    ],
    type: {
      display: 'The body grotesque at large size, or a sharp sans — IBM Plex Sans / Unbounded only if it does not become trendy noise.',
      body: 'IBM Plex Sans or Source Sans 3. High x-height.',
      ui: 'Same as body. Tabular figures. True focus states.',
      hierarchy: 'Weight and size, never a second family unless documentation requires mono (IBM Plex Mono).',
      examples: 'IBM Plex Sans + IBM Plex Mono. Alternative: Source Sans 3. All openly licensed.',
    },
    graphic: 'Grid, not decoration. One line weight. Diagrams. Plenty of air. Motion: instant, no easing theater.',
    photo: {
      subject: 'The product doing the job. Diagrams over lifestyle. People only when they clarify use.',
      lighting: 'Even, accurate color. No mood gel.',
      composition: 'Orthogonal. Catalog discipline. Crop to the function.',
      avoid: 'Abstract 3D that hides the offer. Stock “startup.” Gradient meshes as identity.',
    },
  },
]

function scoreArchetype(arch, client) {
  let s = 4
  if (arch.industries.includes(client.industry)) s += 3
  const perc = `${client.desiredPerception || ''} ${client.admiredBrands || ''} ${client.avoidBrands || ''}`.toLowerCase()
  if (arch.id === 'standard' && /authorit|trust|premium|serious|legacy|professional/.test(perc)) s += 2
  if (arch.id === 'atelier' && /craft|warm|hand|house|intimate|heritage|quality/.test(perc)) s += 2
  if (arch.id === 'signal' && /modern|bold|cultur|fashion|distinct|iconic|fresh/.test(perc)) s += 2
  if (arch.id === 'threshold' && /hospital|welcome|place|room|visit|guest/.test(perc)) s += 2
  if (arch.id === 'ritual' && /wellness|calm|daily|beauty|care|practice/.test(perc)) s += 2
  if (arch.id === 'essence' && /simple|clear|direct|product|useful|minimal/.test(perc)) s += 2
  const action = (client.desiredAction || '').toLowerCase()
  if (arch.id === 'threshold' && /visit|reserve|book/.test(action)) s += 1
  if (arch.id === 'essence' && /buy|subscribe|apply/.test(action)) s += 1
  if (arch.id === 'atelier' && /book|reserve|buy/.test(action)) s += 1
  return s
}

function pickArchetypes(client) {
  const ranked = [...ARCHETYPES].sort((a, b) => scoreArchetype(b, client) - scoreArchetype(a, client))
  const picked = []
  for (const a of ranked) {
    if (picked.length >= 3) break
    picked.push(a)
  }
  return picked
}

function sliderCopy(p) {
  return [
    { left: 'Formal', right: 'Conversational', value: 100 - p.formal },
    { left: 'Traditional', right: 'Progressive', value: p.progressive },
    { left: 'Quiet', right: 'Expressive', value: p.expressive },
    { left: 'Accessible', right: 'Exclusive', value: p.exclusive },
    { left: 'Practical', right: 'Aspirational', value: p.aspirational },
  ]
}

function taglines(arch, c) {
  const n = nameOf(c)
  const map = {
    standard: [
      `The standard, kept.`,
      `${n}. Measured.`,
      `Known by the work.`,
    ],
    atelier: [
      `Made, then held.`,
      `A house, not a storefront.`,
      `The craft, in public.`,
    ],
    signal: [
      `Built to be seen once, remembered after.`,
      `A clear signal.`,
      `Form, then following.`,
    ],
    threshold: [
      `You have arrived.`,
      `The room is ready.`,
      `Cross. Then stay.`,
    ],
    ritual: [
      `Return to it.`,
      `A practice, not a promise.`,
      `Again, better.`,
    ],
    essence: [
      `Only what it is.`,
      `Cut to the work.`,
      `Less, on purpose.`,
    ],
  }
  return map[arch.id]
}

function positioning(arch, c) {
  const n = nameOf(c)
  const offer = offerOf(c)
  const aud = audienceOf(c)
  const place = placeOf(c)
  const map = {
    standard: `${n} is the ${industryOf(c)} house for ${aud} who want ${offer} without theatre — a precise standard in ${place}.`,
    atelier: `${n} is for ${aud} who want ${offer} with a visible hand — a crafted house in ${place}, not a scaled anonymous option.`,
    signal: `${n} is the ${industryOf(c)} brand ${aud} notice and remember — ${offer} given a distinctive form in ${place}.`,
    threshold: `${n} is the place ${aud} cross into — ${offer} staged as an arrival in ${place}.`,
    ritual: `${n} is the practice ${aud} keep — ${offer} designed for return, not for a single performance, in ${place}.`,
    essence: `${n} offers ${aud} ${offer} with nothing extra to decode — a reduced, useful brand in ${place}.`,
  }
  return map[arch.id]
}

function messaging(arch, c) {
  const n = nameOf(c)
  const offer = offerOf(c)
  const action = actionOf(c)
  const ctaMap = {
    Book: `Book ${n}`,
    Buy: `Acquire ${n}`,
    Inquire: `Begin a conversation`,
    Visit: `Plan your visit`,
    Reserve: `Reserve a table`,
    Subscribe: `Enter ${n}`,
    Apply: `Apply to ${n}`,
  }
  const cta = ctaMap[c.desiredAction] || `Inquire with ${n}`
  const hero = {
    standard: `${n}. ${offer}, held to a standard you can inspect.`,
    atelier: `${n}. ${offer}, made with a hand you can name.`,
    signal: `${n}. ${offer}, given a form that carries.`,
    threshold: `${n}. ${offer}, from the moment you cross the door.`,
    ritual: `${n}. ${offer}, as a practice you return to.`,
    essence: `${n}. ${offer}. That is the work.`,
  }
  const support = {
    standard: `Every decision — visual, verbal, commercial — should make ${audienceOf(c)} feel they have found the serious option.`,
    atelier: `Show the method. Name the materials. Let hospitality do what slogans cannot.`,
    signal: `Distinctive enough to recognize in one still. Disciplined enough to last beyond a season.`,
    threshold: `Design the sequence of arrival before you design the mark.`,
    ritual: `Teach the practice. Do not costume it in borrowed spirituality.`,
    essence: `If a line does not help someone ${action.toLowerCase()}, it does not ship.`,
  }
  const proof = filled(c.customerLanguage)
    ? `Use the client’s actual language as proof: “${clean(c.customerLanguage).slice(0, 180)}”`
    : filled(c.differentiators)
      ? `Proof must sit on named differentiators: ${clean(c.differentiators)}.`
      : `Strategic hypothesis — validate with research, client input, analytics, or testing: proof should be specific artifacts (process, place, people, numbers the client can stand behind), never invented testimonials.`
  return {
    hero: hero[arch.id],
    support: support[arch.id],
    proof,
    cta,
  }
}

function webFor(arch, c) {
  const action = actionOf(c)
  const n = nameOf(c)
  const industry = c.industry || ''
  const extraPages = {
    'Restaurant & Dining': ['Menu', 'Reservations', 'Private dining', 'Hours & location'],
    'Hospitality & Hotels': ['Rooms', 'Stay', 'Dining', 'Location', 'Offers'],
    'Personal Brand': ['Work', 'Speaking', 'About', 'Press', 'Contact'],
    Lifestyle: ['Shop', 'Journal', 'About', 'Contact'],
    'Professional Services': ['Work', 'Services', 'Approach', 'Insights', 'Contact'],
    Retail: ['Shop', 'Lookbook', 'Stores', 'About'],
    Beauty: ['Services or shop', 'Approach', 'Booking', 'About'],
    Wellness: ['Programs', 'Practice', 'Booking', 'About'],
    Technology: ['Product', 'Docs or method', 'Customers', 'Pricing if public', 'Contact'],
    'Creative / Studio': ['Selected work', 'Studio', 'Services', 'Contact'],
    Fashion: ['Collection', 'Lookbook', 'Stockists', 'About'],
    'Food & Beverage': ['Products', 'Find us', 'Story', 'Wholesale if true'],
    'Real Estate': ['Properties or practice', 'Neighborhoods', 'About', 'Contact'],
    Other: ['Work', 'About', 'Contact'],
  }
  const pages = extraPages[industry] || extraPages.Other
  const heroes = {
    standard: `A still, full-bleed photograph or a typographic title on Void Ink. One sentence. One ${action.toLowerCase()} CTA. No slider.`,
    atelier: `A process still or a room before service. Overlay the house name in serif. Secondary line names the method. CTA in sans.`,
    signal: `A sculptural crop — product, garment, or space — with the wordmark colliding the image. CTA as a sharp text button.`,
    threshold: `The approach to the door or the first interior. Headline in second person. CTA = ${action}.`,
    ritual: `Hands in the first step of the practice. Headline names the ritual. CTA continues it.`,
    essence: `No hero image required. Name, one-line offer, primary ${action.toLowerCase()} action, and a proof strip. That is the fold.`,
  }
  return {
    homepage: [
      'Utility bar: location / hours / contact if relevant — never hidden',
      `Hero with a single primary action: ${action}`,
      'Proof strip: named differentiators, press only if real, numbers only if supplied by client',
      `Offer architecture: ${offerOf(c)} in scannable groups`,
      'Selected work, rooms, products, or plates — 3 to 6, not a dump',
      'Audience recognition paragraph (who this is for / not for)',
      'Practical details: place, timing, process',
      `Final ${action} band — repeat the primary action`,
    ],
    hero: heroes[arch.id],
    nav: `Short. ${n} wordmark left. ${pages.slice(0, 5).join(' · ')}. Primary ${action} as a button, not a nav link that looks like the others.`,
    proof: filled(c.customerLanguage)
      ? 'A quoted-language module using client-supplied reviews or phrases. Do not invent stars, counts, or names.'
      : 'Do not fabricate testimonials. Use process, materials, team credentials, or documented differentiators. If reviews exist, request them before export.',
    cta: `Primary: ${action}. Secondary: a low-friction alternative (email, call, view menu/work). Never three equal buttons.`,
    mobile: 'Thumb-reachable primary action. Tel and maps links as real links. No hover-only navigation. Type at 16px minimum. Sticky ${action} only if it does not hide content.',
    a11y: 'WCAG AA target: 4.5:1 body, 3:1 large text and UI. Focus states visible. Alt text on all images. Do not use color alone for states. Forms labelled. Reduced-motion respected.',
    pages,
  }
}

function seoFor(c) {
  const n = nameOf(c)
  const place = placeOf(c)
  const offer = offerOf(c)
  const industry = industryOf(c)
  const local = filled(c.location) || filled(c.geoMarket)
  const themes = [
    `${offer} — primary offer language, not slogans`,
    `${industry} in ${place}`,
    `${audienceOf(c)} intents (problems, occasions, jobs-to-be-done)`,
  ]
  if (local) themes.push(`Local entities: ${place}, neighborhoods, “near me” only when the business truly serves walk-in or local search`)
  const titles = [
    `${n} — ${offer} in ${place}`,
    `${offer} | ${n}`,
    `About ${n}`,
    `Work / Menu / Services — ${n}`,
    `Contact ${n}`,
  ]
  const h1s = [
    n,
    offer,
    `How ${n} works`,
    `Visit or contact`,
  ]
  return {
    themes,
    architecture: [
      'One distinct topic per page. Do not duplicate the homepage in /about.',
      'Offer pages split by real service or product lines — not by adjectives.',
      local ? 'A location page with NAP consistency, hours, map, parking/transit if relevant.' : 'If national or digital-only, do not fake local pages.',
      'A proof page (work, menu, journal) that can grow without restyling.',
    ],
    priorityPages: ['Home', 'Offer / Services / Menu / Shop', 'About', 'Proof (work or journal)', 'Contact / Book / Reserve'],
    titles,
    h1s,
    metaConcept: `${n} is [what] for [whom] in [place]. Include the offer and the place. Do not stuff. Do not write “#1” or invented awards.`,
    internal: 'Home → offer pages → proof. Offer pages → contact. About → team/process → contact. Journal/work items → related offer. Footer: NAP, primary links, accessibility statement.',
    faq: 'Only questions the audience actually asks (hours, process, pricing range if the client will publish it, who it is for). Do not invent FAQs to capture queries.',
    blog: filled(c.notes) || true
      ? `Useful pages beat a blog. If content is needed, write from ${audienceOf(c)} jobs-to-be-done, not “5 tips” lists. Case studies only with client permission and real outcomes.`
      : '',
    schema: local
      ? 'Consider LocalBusiness or a more specific type (Restaurant, Hotel, ProfessionalService) once NAP is confirmed. Add FAQ schema only for visible FAQs. Do not mark up invented reviews.'
      : 'Consider Organization and, if applicable, Service or Product. Add FAQ schema only for visible FAQs. Do not mark up invented reviews or ratings.',
    gaps: 'Do not claim current rankings, volumes, or competitor positions. A proper keyword and SERP review is required before any SEO plan is treated as final.',
    disclaimer: 'Strategic hypothesis — validate with research, client input, analytics, or testing. This engine does not promise rankings and does not fabricate search volume.',
  }
}

function marketingFor(arch, c) {
  const action = actionOf(c)
  const n = nameOf(c)
  const channels = {
    standard: ['Own site', 'Referral / private network', 'Selective LinkedIn or industry press', 'Precision email', 'Documented case conversations'],
    atelier: ['Own site', 'Instagram as a journal of making', 'Partnerships with adjacent houses', 'Local press if the place is real', 'Email from the house, not a platform blast'],
    signal: ['Own site', 'Instagram / short video as form not filler', 'Cultural collaborations', 'Editorial placements', 'A tight email list'],
    threshold: ['Own site + reservations platform if relevant', 'Google Business Profile', 'Instagram of the room', 'Local partnerships', 'Host-led email'],
    ritual: ['Own site / shop', 'Instructional content', 'Retail or practitioner partners', 'Email sequences for the practice', 'Quiet social, high craft'],
    essence: ['Own site / product', 'Search for useful queries', 'Documentation or journal', 'Partner integrations or referrals', 'Email that teaches the offer'],
  }
  const pillars = {
    standard: ['The work itself', 'How decisions are made', 'Proof without theatrics', 'Who it is not for'],
    atelier: ['Method', 'Materials / ingredients / place', 'People of the house', 'The finished piece, plate, or room'],
    signal: ['Form', 'Culture around the offer', 'Process as design', 'Releases and seasons'],
    threshold: ['Arrival', 'The table / room / stay', 'People who host', 'The neighborhood as true context'],
    ritual: ['The practice, step by step', 'Materials', 'Return stories (only if real)', 'What to leave out'],
    essence: ['What it does', 'What it refuses', 'How to use it', 'Change log or process notes'],
  }
  const ideas = [
    `A one-sentence positioning film or still series — no voiceover hype.`,
    `“How we decide” — a plain page or carousel of the standard behind ${offerOf(c)}.`,
    `A day in the process, shot documentary, five frames.`,
    `Audience letter: who ${n} is for, and who should go elsewhere.`,
    `Material / method close-ups with captions that name things accurately.`,
    `A founder or host note that does not begin with “I’m passionate.”`,
    `FAQ filmed or written from real sales objections${filled(c.salesObjections) ? `: ${clean(c.salesObjections).slice(0, 120)}` : ' (collect these; do not invent them)'}.`,
    `Before/after only if the transformation is real and permitted.`,
    `A collaboration or table/room/product with an adjacent brand that shares standards.`,
    `Launch or seasonal note: what is new, what is unchanged.`,
  ]
  return {
    channels: channels[arch.id],
    pillars: pillars[arch.id],
    ideas,
    social: `${arch.photo.subject} Consistent 4:5. Caption voice matches the verbal playbook. No engagement bait. Grid is a journal, not a catalogue dump.`,
    cadence: 'Strategic hypothesis — validate: 3–5 owned posts per week is a ceiling, not a virtue. Quality and recognizability over volume. Stories for process; feed for stills that could live in a book.',
    email: `A short nurture: (1) the standard, (2) the method, (3) proof, (4) invitation to ${action.toLowerCase()}. From a person, not “the team.”`,
    referral: filled(c.primaryAudience)
      ? `Ask ${audienceOf(c)} after a successful ${action.toLowerCase()} — a personal introduction, not a points scheme, unless the model truly requires it.`
      : 'Personal introductions after successful work. Do not invent a points program.',
    partners: 'Adjacent houses with shared standards — not logos-on-a-slide. One collaboration done properly beats ten mentions.',
    pr: 'Pitch only when there is a true story (opening, method, place, body of work). Do not buy fake awards.',
    launch: {
      pre: 'Lock positioning, identity basics, site structure, photography brief, and the announcement sentence. Warm the private list. Do not leak half-finished marks.',
      day: `One owned channel, one announcement asset, one ${action.toLowerCase()} path. Press if earned. Team scripted to the same three lines.`,
      thirty: 'Publish proof weekly. Answer objections in public FAQ. Fix conversion friction. Do not redesign. Measure the primary action, not vanity counts.',
    },
    metrics: [
      `Primary: ${action} volume and quality`,
      'Enquiry-to-conversion rate (client-supplied; do not invent a baseline)',
      'Site: hero-to-action, form completion, relevant calls/taps',
      'Brand: unprompted description from 5 customers (qualitative)',
      'Do not treat likes, impressions, or follower counts as success',
    ],
  }
}

function applicationsFor(c) {
  const map = {
    'Restaurant & Dining': ['Website', 'Menu + wine list', 'Signage', 'Reservations emails', 'Uniforms', 'Social', 'Private dining deck'],
    'Hospitality & Hotels': ['Website', 'Wayfinding', 'Key cards & in-room', 'Booking emails', 'Uniforms', 'Social', 'Proposal / group stay deck'],
    'Personal Brand': ['Website', 'Speaking lockup', 'Media kit', 'Social', 'Deck', 'Email signature'],
    Lifestyle: ['Website', 'Packaging', 'Lookbook', 'Social', 'Email', 'Retail signage'],
    'Professional Services': ['Website', 'Proposal deck', 'PDF reports', 'Email signature', 'LinkedIn', 'Office signage'],
    Retail: ['Website / shop', 'Packaging', 'Hangtags', 'Store signage', 'Receipt / bag', 'Social'],
    Beauty: ['Website', 'Menu or PDP', 'Booking flow', 'Packaging', 'Interior graphics', 'Social'],
    Wellness: ['Website', 'Program PDFs', 'Booking', 'Interior', 'Social', 'Email'],
    Technology: ['Product UI', 'Marketing site', 'Docs', 'Deck', 'Email', 'Social (selective)'],
    'Creative / Studio': ['Website', 'Case PDFs', 'Deck', 'Social', 'Email signature', 'Spatial if relevant'],
    Fashion: ['Website', 'Lookbook', 'Labels', 'Show notes', 'Social', 'Stockist materials'],
    'Food & Beverage': ['Packaging', 'Website', 'Wholesale one-pager', 'Social', 'Sell sheets'],
    'Real Estate': ['Website', 'Listing PDFs', 'Signage', 'Deck', 'Email', 'Social'],
    Other: ['Website', 'Social', 'Deck', 'Email signature', 'Print one-sheet'],
  }
  return map[c.industry] || map.Other
}

function buildDirection(arch, c, index) {
  const msg = messaging(arch, c)
  const web = webFor(arch, c)
  const mkt = marketingFor(arch, c)
  return {
    id: arch.id,
    index: index + 1,
    territory: arch.territory,
    name: arch.name(c),
    concept: arch.concept(c),
    signal: arch.signal,
    emotion: arch.emotion,
    fit: arch.fit,
    risk: arch.risk,
    positioning: positioning(arch, c),
    taglines: taglines(arch, c),
    messaging: msg,
    voice: arch.voice,
    wordsUse: arch.use,
    wordsAvoid: arch.avoid,
    logo: arch.logo,
    palette: arch.palette,
    type: arch.type,
    graphic: arch.graphic,
    photo: arch.photo,
    website: web,
    marketing: mkt,
    applications: applicationsFor(c),
    personality: sliderCopy(arch.personality),
    personalityRaw: arch.personality,
    deliverablesNeeded:
      'Identity system (mark, type, color, graphic language), verbal playbook, photography direction, site direction, and launch toolkit if the brand is entering market. Trademark/legal review before any mark, name, or tagline is finalized.',
  }
}

function scoreDirection(dir, c) {
  const perc = `${c.desiredPerception || ''} ${c.goals || ''}`.toLowerCase()
  let strategic = 7
  let diff = 7
  let audience = 7
  let premium = 7
  let conv = 7
  let seo = 7
  let mkt = 7
  let visual = 7
  let ease = 7
  let scale = 7
  let budgetFit = 7
  let risk = 5

  if (dir.id === 'standard') { premium += 2; strategic += 1; visual += 1; audience += filled(c.primaryAudience) ? 1 : 0; ease += 1 }
  if (dir.id === 'atelier') { audience += 1; premium += 1; visual += 1; conv += /book|reserve|buy/i.test(c.desiredAction || '') ? 1 : 0 }
  if (dir.id === 'signal') { diff += 2; visual += 2; mkt += 1; risk += 2; ease -= 1; scale += 1 }
  if (dir.id === 'threshold') { conv += 2; audience += 1; seo += /visit|reserve|book/i.test(c.desiredAction || '') ? 1 : 0 }
  if (dir.id === 'ritual') { mkt += 1; scale += 1; seo += 1; premium += 1 }
  if (dir.id === 'essence') { ease += 2; seo += 2; conv += 1; premium -= 1; visual -= 1 }

  if (dir.territory && perc) {
    if (dir.id === 'standard' && /trust|author|premium|serious/.test(perc)) strategic += 1
    if (dir.id === 'signal' && /distinct|bold|modern|cultur/.test(perc)) strategic += 1
  }
  if ((c.budget || '').includes('Under $8k') && dir.id === 'signal') budgetFit -= 2
  if ((c.budget || '').includes('Under $8k') && dir.id === 'essence') budgetFit += 1
  if ((c.timeline || '').includes('5 days') && dir.id === 'signal') ease -= 2

  const clamp10 = (n) => Math.max(3, Math.min(10, n))
  const scores = {
    strategic: clamp10(strategic),
    differentiation: clamp10(diff),
    audience: clamp10(audience),
    premium: clamp10(premium),
    conversion: clamp10(conv),
    seo: clamp10(seo),
    marketing: clamp10(mkt),
    visual: clamp10(visual),
    ease: clamp10(ease),
    scale: clamp10(scale),
    budget: clamp10(budgetFit),
    risk: clamp10(risk),
  }
  scores.total = Object.values(scores).reduce((a, b) => a + b, 0) - scores.risk
  return scores
}

function buildClarity(c) {
  const n = nameOf(c)
  const essence = filled(c.primaryOffer) && filled(c.primaryAudience)
    ? `${n} provides ${offerOf(c)} for ${audienceOf(c)} in ${placeOf(c)}.`
    : `${n} exists to make ${offerOf(c)} legible, trusted, and chosen by ${audienceOf(c)}. (Strategic hypothesis — complete offer and audience fields to lock this.)`

  const promise = filled(c.desiredPerception)
    ? `${n} will be experienced as: ${clean(c.desiredPerception)}.`
    : `Strategic hypothesis — validate: ${n} promises a standard the audience can inspect — in the work, the room, and the words.`

  const pillars = [
    filled(c.differentiators) ? clean(c.differentiators) : 'A named difference (not “quality” or “service”) — requires client language.',
    filled(c.strengths) ? `Build on current strength: ${clean(c.strengths)}` : 'Proof of craft or method — collect before identity lock.',
    'Verbal and visual consistency across every touchpoint.',
    `A single primary action: ${actionOf(c)}.`,
  ]

  const weAre = [
    `A ${industryOf(c)} brand with a point of view.`,
    filled(c.strengths) ? `Already strong in: ${clean(c.strengths)}` : 'Capable of a higher standard than the current expression suggests.',
  ]
  const weAreNot = [
    filled(c.avoidBrands) ? `Not in the likeness of: ${clean(c.avoidBrands)}` : 'Not a generic category template.',
    'Not a decorative logo project in isolation.',
    'Not a trend costume.',
  ]

  return {
    essence,
    positioning: filled(c.marketPosition)
      ? clean(c.marketPosition)
      : `Strategic hypothesis — validate: For ${audienceOf(c)} who need ${offerOf(c)}, ${n} is the option that holds a visible standard in ${placeOf(c)}.`,
    promise,
    audience: line(c, 'primaryAudience', `Strategic hypothesis — validate: primary audience is still undefined. Do not brief identity until this is named.`),
    secondary: line(c, 'secondaryAudience', 'Not yet supplied.'),
    motivation: line(c, 'motivations', 'Strategic hypothesis — validate with interviews: the audience wants certainty they chose well, and a result they can defend to themselves or others.'),
    objections: line(c, 'objections', filled(c.salesObjections) ? clean(c.salesObjections) : 'Strategic hypothesis — validate: typical objections in this category include price, fit, timing, and trust. Collect the real ones.'),
    pain: line(c, 'painPoints', 'Strategic hypothesis — validate: the audience is tired of interchangeable options and unclear offers.'),
    triggers: `The moment they are ready to ${actionOf(c)} — often after a comparison, a referral, or a failure with a weaker alternative. ${filled(c.goals) ? 'Business context: ' + clean(c.goals) : '(Strategic hypothesis — validate.)'}`,
    conventions: `Most ${industryOf(c)} brands in this band rely on interchangeable visuals, vague quality claims, and borrowed “premium” cues. ${filled(c.competitors) ? 'Named competitors: ' + clean(c.competitors) : 'Competitors not yet named — required before final positioning.'}`,
    whitespace: filled(c.differentiators)
      ? `Own: ${clean(c.differentiators)}`
      : 'Strategic hypothesis — validate: own a standard that can be seen (method, place, judgment, hospitality sequence, or reduction) rather than a claim of being “better.”',
    differentiators: filled(c.differentiators)
      ? joinList(c.differentiators)
      : ['Unspecified — do not invent differentiators. Workshop with the client.'],
    pillars,
    sliders: [
      { left: 'Formal', right: 'Conversational', value: 40 },
      { left: 'Traditional', right: 'Progressive', value: 55 },
      { left: 'Quiet', right: 'Expressive', value: 42 },
      { left: 'Accessible', right: 'Exclusive', value: 58 },
      { left: 'Practical', right: 'Aspirational', value: 60 },
    ],
    slidersNote: 'Default sliders are a starting hypothesis. Replace with direction-specific sliders after a direction is chosen. Adjust in this map as discovery continues.',
    voicePrinciples: [
      'Specific over atmospheric.',
      'Evidence over adjectives.',
      'Short sentences for claims; longer only for method.',
      'Never use “luxury,” “elevated,” “premium,” or “modern” without defining the execution.',
    ],
    weAre,
    weAreNot,
    proofRequired: [
      filled(c.customerLanguage) ? `Customer language on file: ${clean(c.customerLanguage)}` : 'Real customer language, reviews, or interviews — none invented.',
      filled(c.analytics) ? `Performance notes: ${clean(c.analytics)}` : 'Analytics, conversion paths, and objections from sales — request if they exist.',
      'Named differentiators the client will stand behind in public.',
      'Legal/trademark review before names, marks, or taglines are finalized.',
    ],
  }
}

function buildDiagnosis(c, tier, gaps) {
  const n = nameOf(c)
  const perceived = filled(c.marketPosition)
    ? `Currently described as: ${clean(c.marketPosition)}`
    : filled(c.voiceDescription)
      ? `Current voice/expression: ${clean(c.voiceDescription)}`
      : `Strategic hypothesis — validate: ${n} is likely being read as an incomplete or interchangeable ${industryOf(c)} brand — more offer than identity, more activity than position.`

  const businessProblem = filled(c.challenges)
    ? clean(c.challenges)
    : filled(c.unclear)
      ? clean(c.unclear)
      : 'Strategic hypothesis — validate: the visual problem is downstream of an articulation problem. Without a held position, design becomes decoration and marketing becomes noise.'

  const asset = filled(c.strengths)
    ? clean(c.strengths)
    : filled(c.primaryOffer)
      ? `A real offer to build on: ${clean(c.primaryOffer)}`
      : 'Strategic hypothesis — the strongest asset is not yet documented. Identify the thing a current customer would miss if it disappeared.'

  const gap = filled(c.unclear)
    ? clean(c.unclear)
    : 'Clarity, differentiation, and a system that can travel from site to social to room without losing standard.'

  const future = filled(c.desiredPerception)
    ? clean(c.desiredPerception)
    : `Strategic hypothesis — validate: ${n} should be perceived as the standard in its band — specific, trusted, and chosen without needing to shout.`

  return {
    perceived,
    businessProblem,
    asset,
    gap,
    future,
    tierName: tier.name,
    tierWhy: tier.why,
    others: tier.whyOthers,
    confidence: confidenceFrom(c, gaps),
    missing: gaps,
    headline: `Based on the available information, this brand most likely needs ${tier.name} because ${tier.why}`,
  }
}

function buildRoadmap(c, tier) {
  const n = nameOf(c)
  const base = [
    { phase: 'Days 1–15', title: 'Clarity, research, positioning, audit', items: [
      { task: 'Kickoff and intake lock — confirm facts vs open questions', owner: 'Empyré', priority: 'Critical', deps: 'Signed scope', impact: 'Prevents designing on invented facts' },
      { task: 'Content, site, and asset audit', owner: 'Empyré', priority: 'Critical', deps: 'Client access to site/social/files', impact: 'Names what is actually broken' },
      { task: 'Competitive landscape from named competitors only', owner: 'Empyré', priority: 'High', deps: 'Competitor list from client', impact: 'Finds white space without copying' },
      { task: 'Audience language capture (reviews, interviews, sales notes)', owner: 'Client', priority: 'Critical', deps: 'Client supplies sources', impact: 'Voice built from evidence' },
      { task: 'Positioning draft + Brand Clarity Map', owner: 'Empyré', priority: 'Critical', deps: 'Intake complete', impact: 'Foundation for every later decision' },
      { task: 'Creative director review of hypotheses', owner: 'Empyré', priority: 'Critical', deps: 'Draft map', impact: 'Human judgment gate' },
    ]},
    { phase: 'Days 16–45', title: 'Identity, messaging, system', items: [
      { task: 'Three direction territories presented (this engine as first draft)', owner: 'Empyré', priority: 'Critical', deps: 'Approved Clarity Map', impact: 'Choice with strategy, not taste alone' },
      { task: 'Direction lock (or deliberate hybrid)', owner: 'Client', priority: 'Critical', deps: 'Presentation', impact: 'Unblocks identity' },
      { task: 'Verbal playbook: hierarchy, vocabulary, examples', owner: 'Empyré', priority: 'High', deps: 'Direction lock', impact: 'Every collaborator writes in one voice' },
      { task: 'Identity system: mark, type, color, graphic language', owner: 'Empyré', priority: 'Critical', deps: 'Direction lock + trademark search brief', impact: 'Recognizable, usable system' },
      { task: 'Photography / art direction brief', owner: 'Empyré', priority: 'High', deps: 'Direction lock', impact: 'Images stop contradicting the brand' },
      { task: 'Legal review of name, mark, tagline', owner: 'Other', priority: 'Critical', deps: 'Shortlisted marks', impact: 'Do not claim trademark availability in-house' },
    ]},
    { phase: 'Days 46–60', title: 'Website direction, SEO, content, launch prep', items: [
      { task: 'Homepage and template creative direction', owner: 'Empyré', priority: 'Critical', deps: 'Identity system', impact: 'Site becomes the brand in use' },
      { task: 'Information architecture + on-page SEO outline', owner: 'Empyré', priority: 'High', deps: 'Offer list and locations confirmed', impact: 'Useful structure; no ranking promises' },
      { task: 'Build or rebuild (development)', owner: 'Developer', priority: 'Critical', deps: 'Direction, copy, assets', impact: 'Public face' },
      { task: 'Accessibility pass (WCAG AA target)', owner: 'Developer', priority: 'High', deps: 'Working templates', impact: 'Usable, defensible site' },
      { task: 'Launch content: announcement, templates, email, social kit', owner: 'Empyré', priority: 'High', deps: 'Identity + verbal playbook', impact: 'One movement into market' },
      { task: 'Photography production', owner: 'Photographer', priority: 'High', deps: 'Art direction brief', impact: 'Proof the brand is real' },
    ]},
    { phase: 'Days 61–90', title: 'Launch, optimization, outreach, measurement', items: [
      { task: `Launch to primary ${actionOf(c).toLowerCase()} path`, owner: 'Client', priority: 'Critical', deps: 'QA complete, human review', impact: 'Brand in market' },
      { task: 'Fix conversion friction from real use', owner: 'Developer', priority: 'High', deps: 'Analytics access', impact: 'More completed actions' },
      { task: 'Content cadence begins (pillars, not volume)', owner: 'Empyré', priority: 'Medium', deps: 'Playbook', impact: 'Recognition compounds' },
      { task: 'Private outreach / partners / PR only if a true story exists', owner: 'Client', priority: 'Medium', deps: 'Launch assets', impact: 'Earned attention' },
      { task: '30-day debrief + measurement against primary action', owner: 'Empyré', priority: 'High', deps: 'Data from client', impact: 'Learn, do not restyle' },
      { task: 'Decision on Brand Stewardship', owner: 'Client', priority: 'Medium', deps: 'Debrief', impact: 'Protect the standard' },
    ]},
  ]

  if (tier.id === 'sprint') {
    base[1].items = base[1].items.filter((i) => /Verbal|Direction lock|Three direction|Creative/.test(i.task) || /presentation/i.test(i.deps))
    base[1].items.push({ task: 'Visual direction brief (not a full identity system)', owner: 'Empyré', priority: 'Critical', deps: 'Positioning lock', impact: 'Gives later identity a brief, not a guess' })
    base[2].title = 'If continuing: brief identity or pause'
    base[3].title = 'Optional next phase — not included in sprint'
  }
  if (tier.id === 'steward') {
    base[0].title = 'Audit the living system'
    base[1].title = 'Campaign and content direction'
    base[2].title = 'Templates, site refinements, QA'
    base[3].title = 'Ongoing cadence and monthly review'
  }

  return base.map((phase) => ({
    ...phase,
    items: phase.items.map((it) => ({ ...it, status: 'Not started', due: '' })),
  }))
}

function gapsFor(c) {
  const labels = {
    businessName: 'Business name',
    industry: 'Industry',
    primaryOffer: 'Primary offer',
    stage: 'Business stage',
    primaryAudience: 'Primary audience',
    desiredAction: 'Desired customer action',
    challenges: 'Current challenges',
    goals: '6–12 month goals',
    conversionGoal: 'Primary conversion goal',
    competitors: 'Competitors',
    differentiators: 'Differentiators',
    location: 'Location / market',
    desiredPerception: 'Desired perception',
  }
  const need = ['businessName', 'industry', 'primaryOffer', 'stage', 'primaryAudience', 'desiredAction', 'challenges', 'goals', 'conversionGoal']
  const useful = ['competitors', 'differentiators', 'location', 'desiredPerception']
  return [...need, ...useful].filter((k) => !filled(c[k])).map((k) => labels[k] || k)
}

function websiteRecs(c, dir) {
  const w = dir.website
  return {
    hierarchy: w.homepage,
    hero: w.hero,
    nav: w.nav,
    services: `Structure offer pages around how ${audienceOf(c)} buy — not around internal department names. One idea per page.`,
    cta: w.cta,
    proof: w.proof,
    portfolio: filled(c.strengths)
      ? `Lead with proof of: ${clean(c.strengths)}. Caption with method, not adjectives.`
      : '3–6 strongest artifacts. Captions state what it is and for whom. No fake case metrics.',
    contact: `The ${actionOf(c).toLowerCase()} path should be one screen: what happens next, timing, and what to prepare. Reduce form fields to what will actually be read.`,
    mobile: w.mobile,
    a11y: w.a11y,
    friction: [
      'Unclear primary action in the hero',
      'Offer not understandable in five seconds',
      'No proof adjacent to the ask',
      'Contact details buried',
      'Hover-only information',
      'Stock imagery that contradicts the claimed standard',
    ],
    pageStructure: ['Home', ...w.pages, 'Privacy / accessibility as needed'],
    newPages: w.pages,
  }
}

function proposalNotes(c, tier) {
  return {
    recommended: tier.name,
    includes: tier.deliverables,
    outcomes: [
      'A held position the team can repeat',
      'A system that can be used without calling the studio every time',
      'Language that matches the visual standard',
      `A clearer path to ${actionOf(c).toLowerCase()}`,
    ],
    scopeWatch: [
      'Photography production is typically adjacent, not assumed',
      'Development is adjacent unless scoped',
      'Trademark counsel is the client’s (or referred) legal, not Empyré',
      'SEO implementation beyond architecture/on-page direction is a later phase unless scoped',
    ],
    nextStep: 'Creative director review of this draft. Then a debrief with the client to lock facts, kill hypotheses, and confirm tier.',
  }
}

export function generateAssessment(client) {
  const c = client || {}
  const gaps = gapsFor(c)
  const tier = recommendTier(c)
  const diagnosis = buildDiagnosis(c, tier, gaps)
  const clarity = buildClarity(c)
  const arches = pickArchetypes(c)
  const directions = arches.map((a, i) => buildDirection(a, c, i))
  const scores = directions.map((d) => ({ id: d.id, name: d.name, territory: d.territory, ...scoreDirection(d, c) }))
  const ranked = [...scores].sort((a, b) => b.total - a.total)
  const top = ranked[0]
  const second = ranked[1]
  const hybrid = second && top.total - second.total <= 4
  const recDir = directions.find((d) => d.id === top.id)
  const recSecond = directions.find((d) => d.id === second.id)

  const recommended = {
    type: hybrid ? 'hybrid' : 'single',
    statement: hybrid
      ? `Recommended final direction: Hybrid of ${recDir.name} and ${recSecond.name}`
      : `Recommended final direction: ${recDir.name}`,
    why: hybrid
      ? `${recDir.territory} should lead — it best matches the business problem and desired perception. Borrow selected expression from ${recSecond.territory} so the brand does not freeze into a single register.`
      : `${recDir.territory} is the strongest fit for audience, commercial goal, and a standard that can scale without costume.`,
    believe: recDir.signal,
    achieve: `A brand that can be understood, trusted, remembered, and chosen — and a clear Empyré path via ${tier.name}.`,
    retain: hybrid
      ? `Retain from ${recDir.territory}: positioning, voice discipline, and primary system. Retain from ${recSecond.territory}: selected imagery, one graphic behavior, and the warmer or sharper register where conversion needs it.`
      : `Retain the positioning, voice rules, and system logic of ${recDir.territory}.`,
    exclude: hybrid
      ? `Do not average the palettes into mud. Do not run two marks. Do not mix opposing voice rules in one paragraph.`
      : `Exclude trend costume, undefined “luxury” cues, and any element that looks like a competitor named by the client.`,
    test: [
      'Read the hero sentence to three target customers. Ask what they think the brand does.',
      'Print the palette and type on paper. Check contrast.',
      'Trademark/legal review of shortlisted names, marks, taglines.',
      'Confirm photography is producible on budget and timeline.',
    ],
    audienceFit: recDir.fit,
    goalFit: filled(c.goals) ? clean(c.goals) : 'Confirm 6–12 month goals before locking.',
    premiumFit: recDir.id === 'essence' ? 'Premium through reduction and judgment, not ornament.' : 'Premium through restraint, material truth, and evidence.',
    scaleFit: 'Built as a system (type, color, language, image) so campaigns can vary without a new identity.',
  }

  const comparisonCriteria = [
    { key: 'strategic', label: 'Strategic fit' },
    { key: 'differentiation', label: 'Differentiation' },
    { key: 'audience', label: 'Audience resonance' },
    { key: 'premium', label: 'Premium perception' },
    { key: 'conversion', label: 'Conversion potential' },
    { key: 'seo', label: 'SEO / content potential' },
    { key: 'marketing', label: 'Marketing flexibility' },
    { key: 'visual', label: 'Visual memorability' },
    { key: 'ease', label: 'Ease of implementation' },
    { key: 'scale', label: 'Long-term scalability' },
    { key: 'budget', label: 'Alignment with budget / tier' },
    { key: 'risk', label: 'Risk level (higher = more risk)' },
  ]

  const seo = seoFor(c)
  const marketing = marketingFor(recDir, c)
  const web = websiteRecs(c, recDir)
  const roadmap = buildRoadmap(c, tier)
  const proposal = proposalNotes(c, tier)

  const closing = `${nameOf(c)} does not need more decoration. It needs a held standard — in language, in form, and in the path to ${actionOf(c).toLowerCase()}. Empyré’s next step is ${tier.name}: ${tier.line} This draft is a strategic first pass. It is not finished creative work. A human creative director must review, kill what is merely attractive, and lock what is true.`

  return {
    generatedAt: new Date().toISOString(),
    engineVersion: '1.0.0',
    diagnosis,
    clarity,
    tier,
    directions,
    scores,
    comparisonCriteria,
    recommended,
    web,
    seo,
    marketing,
    roadmap,
    proposal,
    closing,
    applications: applicationsFor(c),
    flags: {
      incomplete: gaps.length > 0,
      hypothesesUsed: true,
      trademark: 'Do not claim trademark availability. Recommend formal search and legal counsel before finalizing a name, logo, or tagline.',
      noInventedProof: 'No testimonials, rankings, volumes, or performance metrics were invented.',
    },
  }
}

export function demoClient() {
  return {
    businessName: 'Example Brand',
    website: '',
    socials: '',
    location: 'A named city (placeholder)',
    industry: 'Professional Services',
    businessModel: 'Service',
    primaryOffer: 'A clearly defined professional service (placeholder)',
    typicalValue: 'Not supplied',
    stage: 'growing',
    primaryAudience: 'A defined primary client type (placeholder)',
    secondaryAudience: 'A secondary audience (placeholder)',
    motivations: 'Wants a partner who holds a standard and can be trusted in the room.',
    objections: 'Unsure whether the brand is the right calibre; comparison with more visible firms.',
    painPoints: 'Has outgrown an improvised identity; materials do not match the work.',
    desiredAction: 'Inquire',
    geoMarket: 'Regional (placeholder)',
    strengths: 'Strong body of work; weak expression of it.',
    challenges: 'Positioning and identity have not kept pace with the practice.',
    unclear: 'How we are different; how we should look and sound as we grow.',
    mustRemain: 'The name Example Brand is demo-only and must be replaced. No real client data is included.',
    voiceDescription: 'Currently inconsistent — competent in person, generic on paper.',
    admiredBrands: 'Brands that are quiet, precise, and specific (unnamed here on purpose).',
    avoidBrands: 'Generic “modern professional” templates; loud personal-brand theatrics.',
    currentWebsite: '',
    competitors: 'Category peers (to be named by the real client).',
    alternatives: 'Larger firms and freelance generalists.',
    marketPosition: 'Currently under-positioned relative to the quality of the work.',
    differentiators: 'Judgment, method, and a higher standard of delivery than the current brand suggests.',
    salesObjections: 'Price without perceived calibre; “we already have a designer.”',
    customerLanguage: '',
    analytics: '',
    goals: 'Enter the next year with a brand that matches the work and a site that converts the right inquiries.',
    conversionGoal: 'Qualified inquiries from the right client type.',
    desiredPerception: 'The serious, specific option — not the loudest.',
    timeline: '8–12 weeks',
    budget: 'To be determined',
    preferredService: '',
    requiredDeliverables: '',
    notes: 'DEMO RECORD. Replace entirely before any real client work. Do not treat this as research.',
    assets: [],
  }
}
