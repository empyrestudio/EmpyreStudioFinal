export const NAV = [
  { group: 'Command', items: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pipeline', label: 'CRM Pipeline' },
    { id: 'leads', label: 'Leads' },
    { id: 'clients', label: 'Clients' },
  ]},
  { group: 'Strategy', items: [
    { id: 'assessments', label: 'Assessments' },
    { id: 'index', label: 'Standard Index' },
    { id: 'intake', label: 'Intake' },
    { id: 'directions', label: 'Brand Directions' },
    { id: 'moodboards', label: 'Mood Boards' },
    { id: 'proposals', label: 'Proposals + Reports' },
  ]},
  { group: 'Delivery', items: [
    { id: 'projects', label: 'Projects' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'deliverables', label: 'Deliverables' },
    { id: 'approvals', label: 'Approvals' },
  ]},
  { group: 'Studio', items: [
    { id: 'meetings', label: 'Meetings + Notes' },
    { id: 'comms', label: 'Communication' },
    { id: 'files', label: 'Files + Assets' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'standard', label: 'Studio standard' },
    { id: 'settings', label: 'Settings' },
  ]},
]

export const PIPELINE = [
  { id: 'inquiry', label: 'New inquiry' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'discovery-scheduled', label: 'Discovery scheduled' },
  { id: 'discovery-complete', label: 'Discovery complete' },
  { id: 'proposal-prep', label: 'Proposal in preparation' },
  { id: 'proposal-sent', label: 'Proposal sent' },
  { id: 'follow-up', label: 'Follow-up' },
  { id: 'verbal-yes', label: 'Verbal yes' },
  { id: 'contract', label: 'Contract / deposit pending' },
  { id: 'won', label: 'Won / onboarding' },
  { id: 'nurture', label: 'Nurture' },
  { id: 'lost', label: 'Lost' },
  { id: 'archived', label: 'Archived' },
]

export const PROCESS = [
  { id: 'discovery', label: 'Discovery' },
  { id: 'excavation', label: 'Excavation' },
  { id: 'creation', label: 'Creation' },
  { id: 'refinement', label: 'Refinement' },
  { id: 'elevation', label: 'Elevation' },
]

export const PROJECT_STATUS = [
  'Not started', 'Intake in progress', 'Discovery', 'Strategy', 'Creative development',
  'Client review', 'Revisions', 'Production', 'Launch preparation', 'Launch',
  'Ongoing stewardship', 'On hold', 'Completed', 'Archived',
]

export const HEALTH = [
  'On track', 'Needs attention', 'At risk', 'Waiting on client',
  'Waiting on Empyré', 'Paused', 'Completed', 'Archived',
]

export const REL_HEALTH = ['Strong', 'Stable', 'Needs attention', 'At risk']
export const RETENTION = ['Active', 'Archived', 'Scheduled for deletion']
export const TASK_STATUS = ['Not started', 'In progress', 'Waiting on client', 'Waiting on team', 'Needs review', 'Revisions', 'Approved', 'Completed', 'Cancelled']
export const TASK_PRIORITY = ['Critical', 'High', 'Medium', 'Low']
export const DELIV_STATUS = ['Planned', 'In progress', 'Internal review', 'Sent to client', 'Client feedback received', 'Revisions', 'Approved', 'Delivered', 'On hold', 'Cancelled']
export const APPROVAL_STATUS = ['Not requested', 'Ready to send', 'Sent', 'Viewed', 'Feedback received', 'Revision requested', 'Approved', 'Declined', 'Expired']
export const SIGNATURE_STATUS = ['Not started', 'In discovery', 'In development', 'Internal review', 'Client review', 'Revisions', 'Approved', 'Delivered', 'Archived']
export const PROPOSAL_STATUS = ['Draft', 'Internal review', 'Ready to send', 'Sent', 'Client questions', 'Revised', 'Accepted', 'Declined', 'Expired']
export const MEETING_TYPES = ['Discovery call', 'Strategy workshop', 'Kickoff', 'Check-in', 'Internal review', 'Client review', 'Revision session', 'Launch planning', 'Launch debrief', 'Monthly stewardship review', 'Follow-up call']
export const COMM_TYPES = ['Email', 'Call', 'Meeting', 'Text', 'Social DM', 'Proposal', 'Follow-up', 'Invoice reminder', 'Approval request', 'File delivery', 'Internal note', 'Website inquiry']
export const NOTE_CATS = ['Creative direction', 'Strategy', 'Scope risk', 'Client communication', 'Pricing', 'Legal/trademark', 'Research', 'Follow-up', 'Blocker', 'Personal reminder', 'Human review required']
export const PROJECT_TYPES = ['Brand Clarity Sprint', 'Identity Transformation', 'Signature Launch Suite', 'Brand Stewardship', 'Website Elevation', 'Campaign', 'Launch', 'Content System', 'Custom Project']
export const FILE_CATS = ['Logo', 'Guidelines', 'Photography', 'Ads', 'Website', 'Deck', 'Menu', 'Product', 'Print', 'Packaging', 'Social', 'Analytics', 'Discovery', 'Competitor', 'Inspiration', 'Other']
export const COMMS_TEMPLATES = [
  { id: 'inquiry', name: 'New inquiry reply', body: 'Thank you for writing. We would like to understand the business before we speak about design. A short discovery call will tell us whether Empyré is the right studio.' },
  { id: 'discovery', name: 'Discovery-call confirmation', body: 'Confirming our discovery conversation. Come ready to speak about the offer, the audience, and what currently limits the brand.' },
  { id: 'intake', name: 'Intake reminder', body: 'The Brand Elevation Assessment is only as strong as the facts behind it. Please complete the remaining intake fields so we are not designing on hypotheses.' },
  { id: 'proposal', name: 'Proposal follow-up', body: 'Following up on the proposed engagement. Happy to walk the diagnosis, the three directions, and the recommended tier.' },
  { id: 'feedback', name: 'Client-feedback reminder', body: 'We are holding the next stage until your notes arrive. A short written response is enough to keep the work moving.' },
  { id: 'approval', name: 'Approval request', body: 'Ready for your decision on the item linked here. Approve, request revision, or tell us what is unresolved.' },
  { id: 'delivery', name: 'Deliverable delivery', body: 'The files are ready. This is a working delivery — confirm receipt and note any revision within the agreed window.' },
  { id: 'status', name: 'Project-status update', body: 'A concise status: where we are in the Empyré process, what is blocked, and the next action on each side.' },
  { id: 'launch', name: 'Launch announcement', body: 'The brand is ready to enter the market. One message, one primary action, no noise.' },
  { id: 'retainer', name: 'Retainer check-in', body: 'Monthly stewardship review: what held, what drifted, and what the next thirty days require.' },
  { id: 'complete', name: 'Project completion follow-up', body: 'The engagement is complete. We recommend a 30-day check-in to protect the standard in live use.' },
  { id: 'referral', name: 'Referral request', body: 'If the work met the standard, a considered introduction is the most useful next gesture.' },
]

export const LOGO_MARK_TYPES = ['Wordmark', 'Monogram', 'Symbol', 'Emblem', 'Combination mark', 'Custom typographic system']
export const LOGO_VERDICTS = ['Keep', 'Refine', 'Rebuild', 'Replace', 'No existing logo to assess']
export const EVIDENCE_LABELS = [
  'Client-provided fact',
  'Website observation',
  'Asset review',
  'Competitor/category observation',
  'Customer language',
  'Review/testimonial evidence',
  'Analytics evidence',
  'Local-market context',
  'SEO hypothesis',
  'Strategic hypothesis',
  'Creative recommendation',
  'Requires validation',
]
