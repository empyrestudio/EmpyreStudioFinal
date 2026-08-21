import { filled, clean, nameOf, industryOf } from './utils.js'
import { evidenceScore } from './os.js'

export function assessLogo(client = {}) {
  const hasFiles = Array.isArray(client.assets) && client.assets.length > 0
  const blob = `${client.challenges || ''} ${client.unclear || ''} ${client.logoStatus || ''}`.toLowerCase()
  const mentionsLogo = /logo|mark|identity|wordmark/.test(blob)
  const broken = /outdated|inconsistent|diy|canva|cheap|unprofessional|redraw|redesign/.test(blob)
  let verdict = 'No existing logo to assess'
  if (hasFiles || mentionsLogo || filled(client.logoStatus)) {
    if (broken) verdict = /inconsistent/.test(blob) ? 'Rebuild' : 'Replace'
    else if (hasFiles && !broken) verdict = 'Refine'
    else verdict = 'Rebuild'
  }
  const rationale = hasFiles
    ? 'Client supplied visual assets. Assess alignment with the locked direction before treating any mark as final.'
    : 'No production logo files are on record. Do not invent a mark. Brief the system from positioning first.'
  return {
    verdict,
    rationale,
    hasFiles,
    flags: [
      'Strategic alignment — unknown until a direction is locked',
      'Legibility and small-size performance — require file review',
      'One-color and reverse — require production files',
      'Do not claim trademark availability',
    ],
    disclaimer: 'Logo and naming directions are strategic creative concepts only. Before final selection or launch, conduct a professional trademark clearance review, including searches for similar names, marks, and relevant goods/services.',
  }
}

export function logoBriefs(directions = []) {
  const types = ['Custom typographic system', 'Combination mark', 'Wordmark']
  return directions.map((d, i) => ({
    directionId: d.id,
    directionName: d.name,
    markType: d.logo?.type || types[i] || 'Wordmark',
    rationale: d.logo?.logic || d.concept,
    traits: d.voice,
    construction: d.logo?.logic,
    geometry: d.graphic,
    typeBehavior: d.type?.display,
    symbolTerritory: d.logo?.cues,
    uses: d.logo?.uses,
    avoid: d.logo?.avoid,
    system: ['Primary mark', 'Secondary / lockup', 'Social avatar / favicon', 'One-color', 'Reversed / light'],
    next: 'Draw from this brief only after direction lock and trademark search brief.',
  }))
}

export function moodBoardFromDirection(direction, client) {
  const pal = direction.palette || []
  const tiles = []
  pal.slice(0, 4).forEach((p, i) => {
    tiles.push({
      id: `c${i}`,
      kind: 'color',
      title: p.name,
      caption: `${p.role}. ${p.rationale}`,
      hex: p.hex,
      locked: false,
    })
  })
  tiles.push({
    id: 'type',
    kind: 'type',
    title: 'Typography atmosphere',
    caption: direction.type?.display || 'Display serif with a working sans.',
    specimen: nameOf(client),
    locked: false,
  })
  tiles.push({
    id: 'mark',
    kind: 'mark',
    title: 'Logo-form territory',
    caption: direction.logo?.type || 'Mark as structure, not ornament.',
    locked: false,
  })
  tiles.push({
    id: 'light',
    kind: 'light',
    title: 'Lighting',
    caption: direction.photo?.lighting || 'Controlled, honest light.',
    locked: false,
  })
  tiles.push({
    id: 'photo',
    kind: 'photo',
    title: 'Photography crop',
    caption: direction.photo?.subject || 'Subject before lifestyle.',
    locked: false,
  })
  tiles.push({
    id: 'layout',
    kind: 'layout',
    title: 'Editorial layout',
    caption: direction.graphic || 'Margin, rule, hierarchy.',
    locked: false,
  })
  tiles.push({
    id: 'ui',
    kind: 'ui',
    title: 'Digital / UI',
    caption: direction.website?.hero || 'One action in the hero.',
    locked: false,
  })
  tiles.push({
    id: 'apply',
    kind: 'apply',
    title: 'Application',
    caption: (direction.applications || []).slice(0, 3).join(' · ') || 'Site, paper, room.',
    locked: false,
  })
  tiles.push({
    id: 'motion',
    kind: 'motion',
    title: 'Motion still',
    caption: 'Slow, precise, no bounce. A still that implies movement.',
    locked: false,
  })
  return {
    id: `mb-${direction.id}`,
    directionId: direction.id,
    title: `${direction.territory} — visual world`,
    artDirection: direction.concept,
    feeling: direction.emotion,
    role: direction.signal,
    colorAtmosphere: pal.map((p) => p.name).join(', '),
    materials: direction.graphic,
    lighting: direction.photo?.lighting,
    photography: direction.photo?.subject,
    typeCharacter: direction.type?.display,
    layout: direction.graphic,
    motion: 'Short, mechanical or slow fade — never decorative bounce.',
    avoid: direction.photo?.avoid,
    cdNote: 'This board is a brief, not finished art. Replace tiles with licensed or original photography before client presentation.',
    internalNotes: 'Exclude competitor references from exports. Original abstract tiles only unless the client supplies assets.',
    clientSafe: false,
    tiles,
  }
}

export function enrichAssessment(assessment, client) {
  const evidence = evidenceScore(client)
  const logo = assessLogo(client)
  const briefs = logoBriefs(assessment.directions || [])
  const moodboards = (assessment.directions || []).map((d) => moodBoardFromDirection(d, client))
  return {
    ...assessment,
    evidence,
    logo,
    logoBriefs: briefs,
    moodboards,
    readyForClient: evidence.score >= 60 && !!assessment.tier,
  }
}

export { evidenceScore }
