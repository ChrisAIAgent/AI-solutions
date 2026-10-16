export const workspaceCategories = [
  { id: 'all', label: 'All workspaces' },
  { id: 'sales-customer', label: 'Sales & Customers' },
  { id: 'marketing-content', label: 'Marketing & Content' },
  { id: 'admin-office', label: 'Admin & Office' },
  { id: 'business-analysis', label: 'Business Analysis' },
  { id: 'project-delivery', label: 'Project Delivery' }
];

export const workspaceStatuses = {
  concept: {
    label: 'Concept example',
    importLabel: 'Import not available',
    detailNotice: 'This is a concept example. No executable workspace package is provided, so it cannot be imported.'
  },
  preview: {
    label: 'Preview',
    importLabel: 'Import is not enabled in this prototype',
    detailNotice: 'This preview does not include an executable workspace package.'
  },
  available: {
    label: 'Available',
    incompleteLabel: 'Package details incomplete',
    importLabel: 'Import is not implemented in this prototype',
    incompleteImportLabel: 'Import unavailable',
    detailNotice: 'The package status is marked available, but this prototype does not implement workspace import.'
  },
  withdrawn: {
    label: 'Withdrawn',
    importLabel: 'Import unavailable',
    detailNotice: 'This workspace is withdrawn and cannot be imported.'
  }
};

const conceptMetadata = {
  status: 'concept',
  version: null,
  author: null,
  updatedAt: null,
  compatibility: { minimumTacWorkVersion: null, supportedSystems: [] },
  distribution: null
};

export const workspaces = [
  {
    ...conceptMetadata,
    id: 'sales-weekly-report',
    name: 'Sales Weekly Report',
    categoryId: 'business-analysis',
    purpose: 'Turn sales activity and follow-up records into a weekly operating brief.',
    inputs: ['Sales table for the reporting period', 'Customer follow-up log'],
    outputs: ['Operating summary', 'Items that need review', 'Suggested next steps'],
    scenario: 'Prepare a consistent weekly view of sales activity, open follow-ups, and emerging gaps before a team review.',
    materials: ['A sales spreadsheet with a clear reporting period', 'Follow-up records with dates and current status', 'Definitions for pipeline stages or targets, if used'],
    steps: ['Confirm the reporting period and field meanings.', 'Summarize changes and follow-up activity from the supplied files.', 'Flag missing, stale, or inconsistent records for review.', 'Draft a concise summary and suggested next steps.'],
    structure: [
      'sales-weekly-report/',
      '├── input/',
      '│   ├── sales.csv',
      '│   └── follow-ups.csv',
      '└── output/',
      '    ├── weekly-summary.md',
      '    ├── items-to-review.md',
      '    └── next-steps.csv'
    ],
    dependencies: ['TACWork desktop app.', 'A model or provider selected by the team; none is prescribed by this concept.'],
    permissions: ['Read only the files the user chooses to provide.', 'Write draft outputs only to a user-selected workspace.', 'No CRM connection is included in this concept.'],
    humanChecks: ['Verify totals, stage changes, and reporting dates.', 'Review suggested actions and owners before sharing the report.'],
    preview: {
      type: 'summary-table',
      title: 'Weekly operating brief',
      highlights: [
        { label: 'Reporting period', value: 'Example week' },
        { label: 'Items to review', value: '2 example records' }
      ],
      columns: ['Example record', 'Follow-up draft', 'Review status'],
      rows: [
        ['Example account A', 'Confirm next step', 'Needs review'],
        ['Example account B', 'Check follow-up date', 'Needs review']
      ]
    },
    featured: true
  },
  {
    ...conceptMetadata,
    id: 'customer-enquiry-organizer',
    name: 'Customer Enquiry Organizer',
    categoryId: 'sales-customer',
    purpose: 'Organize Excel or CSV enquiries into customer groups, a follow-up table, and reply drafts.',
    inputs: ['Excel or CSV enquiry export', 'Optional product or service reference notes'],
    outputs: ['Grouped enquiry list', 'Follow-up table with suggested priorities', 'Reply drafts for review'],
    scenario: 'Triage a batch of inbound enquiries and prepare a clear queue for a sales or service team.',
    materials: ['An Excel or CSV file containing enquiry details', 'Column definitions for dates, products, and enquiry status', 'Approved tone or response guidance, if reply drafts are needed'],
    steps: ['Review the file columns and agree on grouping rules.', 'Group enquiries by the selected customer or business attributes.', 'Identify missing details and prepare a follow-up queue.', 'Draft responses for a person to review and send.'],
    structure: [
      'customer-enquiry-organizer/',
      '├── input/',
      '│   ├── enquiries.xlsx',
      '│   └── response-guidance.md',
      '└── output/',
      '    ├── enquiry-groups.csv',
      '    ├── follow-up-queue.csv',
      '    └── reply-drafts.md'
    ],
    dependencies: ['TACWork desktop app.', 'A model or provider selected by the team; none is prescribed by this concept.'],
    permissions: ['Read only the enquiry file and reference notes supplied by the user.', 'Write draft tables and replies to a user-selected workspace.', 'No mailbox, CRM, or customer system is connected in this concept.'],
    humanChecks: ['Confirm classifications and priority before assigning follow-ups.', 'Check each reply for accuracy and approve it before sending.'],
    preview: {
      type: 'table',
      title: 'Enquiry groups and follow-up queue',
      columns: ['Example enquiry', 'Group', 'Next step'],
      rows: [
        ['Example enquiry 001', 'Product question', 'Prepare a reply draft'],
        ['Example enquiry 002', 'Service request', 'Check missing details'],
        ['Example enquiry 003', 'General information', 'Route for review']
      ]
    },
    featured: true
  },
  {
    ...conceptMetadata,
    id: 'business-content-planner',
    name: 'Business Content Planner',
    categoryId: 'marketing-content',
    purpose: 'Shape product information and brand requirements into topics, a content calendar, and article drafts.',
    inputs: ['Product or service information', 'Brand and audience guidance'],
    outputs: ['Topic proposals', 'Content calendar draft', 'Article drafts for review'],
    scenario: 'Help a small marketing team turn approved product materials into an organized plan for upcoming content.',
    materials: ['Current product or service descriptions', 'Audience profiles and channel requirements', 'Brand voice, terminology, and claims guidance'],
    steps: ['Review product facts, audience, and brand constraints.', 'Propose topics tied to the supplied materials.', 'Arrange selected topics into a draft calendar.', 'Prepare article drafts with source notes for editorial review.'],
    structure: [
      'business-content-planner/',
      '├── input/',
      '│   ├── product-information.md',
      '│   └── brand-guidance.md',
      '└── output/',
      '    ├── topic-proposals.md',
      '    ├── content-calendar.csv',
      '    └── article-drafts/'
    ],
    dependencies: ['TACWork desktop app.', 'A model or provider selected by the team; none is prescribed by this concept.'],
    permissions: ['Read the product and brand files selected by the user.', 'Write planning documents and drafts to a user-selected workspace.', 'No publishing account or content platform is connected in this concept.'],
    humanChecks: ['Verify product claims and current details against approved source material.', 'Approve tone, calendar dates, and final copy before publication.'],
    preview: {
      type: 'table',
      title: 'Draft content calendar',
      columns: ['Example topic', 'Channel', 'Planning note'],
      rows: [
        ['Product overview', 'Company blog', 'Outline for review'],
        ['Common customer questions', 'Email newsletter', 'Source check needed'],
        ['Feature introduction', 'Social post', 'Copy draft pending']
      ]
    },
    featured: true
  },
  {
    ...conceptMetadata,
    id: 'meeting-action-organizer',
    name: 'Meeting Action Organizer',
    categoryId: 'admin-office',
    purpose: 'Turn meeting notes into a decision summary, named owners, and a task list for review.',
    inputs: ['Meeting notes or transcript', 'Optional team and project context'],
    outputs: ['Decision summary', 'Action table with proposed owners', 'Open questions list'],
    scenario: 'Make meeting follow-through easier by separating decisions, tasks, and unresolved questions in one draft.',
    materials: ['Meeting notes or a transcript the user is allowed to share', 'Participant names and roles, if they should appear in the action table', 'Existing task or project conventions, if applicable'],
    steps: ['Review notes and identify the meeting date and participants.', 'Separate confirmed decisions from discussion points.', 'Draft action items with proposed owners and dates where stated.', 'List ambiguities for the meeting owner to resolve.'],
    structure: [
      'meeting-action-organizer/',
      '├── input/',
      '│   └── meeting-notes.md',
      '└── output/',
      '    ├── decisions.md',
      '    ├── action-items.csv',
      '    └── open-questions.md'
    ],
    dependencies: ['TACWork desktop app.', 'A model or provider selected by the team; none is prescribed by this concept.'],
    permissions: ['Read only the notes and context files supplied by the user.', 'Write draft summaries to a user-selected workspace.', 'No calendar, email, or task system is connected in this concept.'],
    humanChecks: ['Confirm that decisions and quotations reflect the meeting record.', 'Verify owners and due dates before sharing or creating tasks.'],
    preview: {
      type: 'summary-table',
      title: 'Decision and action draft',
      highlights: [
        { label: 'Decision notes', value: '2 fictional examples' },
        { label: 'Open questions', value: '1 fictional example' }
      ],
      columns: ['Example action', 'Proposed owner', 'Check before sharing'],
      rows: [
        ['Confirm scope note', 'Example role A', 'Owner not confirmed'],
        ['Review draft outline', 'Example role B', 'Due date not stated']
      ]
    },
    featured: false
  },
  {
    ...conceptMetadata,
    id: 'project-delivery-review',
    name: 'Project Delivery Review',
    categoryId: 'project-delivery',
    purpose: 'Compare project materials with delivery requirements and draft a gap report and handover documents.',
    inputs: ['Project documents and deliverables', 'Delivery checklist or acceptance requirements'],
    outputs: ['Missing-item report', 'Requirements-to-evidence table', 'Handover document drafts'],
    scenario: 'Prepare a structured delivery review before a project handover or customer acceptance meeting.',
    materials: ['The project files intended for review', 'A current delivery or acceptance checklist', 'Naming rules and required handover sections, if available'],
    steps: ['Confirm the review scope and latest requirements.', 'Map available materials to each delivery requirement.', 'List missing, ambiguous, or outdated evidence.', 'Draft handover documents for the project owner to complete.'],
    structure: [
      'project-delivery-review/',
      '├── input/',
      '│   ├── project-materials/',
      '│   └── delivery-requirements.md',
      '└── output/',
      '    ├── requirements-review.csv',
      '    ├── missing-items.md',
      '    └── handover-draft.md'
    ],
    dependencies: ['TACWork desktop app.', 'A model or provider selected by the team; none is prescribed by this concept.'],
    permissions: ['Read only the project materials selected for review.', 'Write draft reports to a user-selected workspace.', 'No project-management or document system is connected in this concept.'],
    humanChecks: ['Confirm the correct project version and acceptance criteria.', 'Review every gap and handover statement before delivery.'],
    preview: {
      type: 'table',
      title: 'Requirements review draft',
      columns: ['Example requirement', 'Illustrative evidence', 'Review state'],
      rows: [
        ['Overview document', 'Example overview file', 'Check current version'],
        ['Delivery checklist', 'No example file listed', 'Confirm whether missing'],
        ['Handover notes', 'Example notes draft', 'Owner review needed']
      ]
    },
    featured: false
  }
];

export const getWorkspaceById = (id) => workspaces.find((workspace) => workspace.id === id) || null;
