// TAC home page content is deliberately centralized so the internal preview
// structure can later be swapped for approved production copy without DOM edits.
// Local-only visual alignment mode. Switch to `tac` before any public build.
import { emailTac } from './tac-contact.js';

export const CONTENT_MODE = 'tac';

const action = (label, href = '#contact') => ({ label, href });

export const tacContent = {
  download: {
    product: 'TACWork',
    version: '0.2.3',
    releaseType: 'Stable release',
    platform: 'Windows x64',
    available: true,
    artifact: 'https://43.172.73.230/downloads/tacwork/latest',
    label: 'Download for Windows',
    navLabel: 'Explore TACWork',
    fileName: 'tacwork-win-x64-0.2.3.exe',
    fileSize: '179.3 MB (171 MiB)',
    checksum: 'bc80874ea02f76baa46d8ec9b7d59fac414141156fe745cbc88388cd1aade687',
    accessNote: 'Enter your download Key on the official TACWork download page.',
    securityNotice: 'This Windows installer is not code-signed. Windows may display an unknown publisher or SmartScreen warning. Review the prompt carefully and do not disable security protections.'
  },
  nav: [
    { label: 'Agent Platform', target: '#platform', items: [
      { label: 'TACWork', href: 'https://aisolution.worldtoolx.com/pages/tacwork-download', sameTab: true },
      { label: 'TAC Harness', href: './pages/tac-harness.html' },
      { label: 'TAC CLI', href: './pages/tac-cli.html', note: 'Coming soon' }
    ] },
    { label: 'Agentic AI Apps', target: '#applications', items: [
      { label: 'Pre-built applications', href: '#Pre-built-Applications', kind: 'section' },
      { label: 'Application accelerators', href: '#Application-Accelerators', kind: 'section' },
      { label: 'Tailored applications', href: '#Tailored-Applications', kind: 'section' }
    ] },
    { label: 'Agent Marketplace', target: '#applications', items: [
      { label: 'Workspaces', href: './pages/tac-workspaces.html' },
      { label: 'Plugin', href: './pages/tac-plugins.html' },
      { label: 'Integrations', disabled: true, note: 'Coming soon' },
      { label: 'Skills', href: './pages/skills.html' },
      { label: 'TAC AI Assistant Asset Lab', href: './pages/tac-assistant-assets.html' }
    ] },
    { label: 'More', target: '#insights', items: [
      { label: 'Industry insights', href: '#insights', kind: 'section' },
      { label: 'Partner ecosystem', href: '#partners', kind: 'section' },
      { label: 'Contact TAC', href: '/pages/contact-us.html' }
    ] }
  ],
  hero: {
    eyebrow: 'TAC AI PLATFORM',
    title: 'Build AI operations that move with your business.',
    lead: 'TAC brings intelligent automation, connected knowledge, and governed AI workflows together for teams ready to operate at scale.',
    primary: action('GET IN TOUCH', '#contact'),
    secondary: action('EXPLORE THE PLATFORM', '#platform'),
    featureCards: [
      { title: 'Pre-built Applications', text: 'Use applications for Banking, Healthcare, Retail, HR, IT, and Recruiting today.' },
      { title: 'Application Accelerators', text: 'Leverage reusable agents, templates, and integrations to move from idea to workflow.' },
      { title: 'Tailored Applications', text: 'Design and build applications on the TAC Agent Platform across enterprise use cases.' }
    ]
  },
  industries: [
    { id: 'banking', label: 'BANKING', title: 'Trusted intelligence for every financial conversation.', text: 'Help teams bring consistent context, clear next steps, and controlled AI assistance to complex customer journeys.', logos: ['Risk operations', 'Service teams', 'Advisors', 'Compliance'], tone: 'blue' },
    { id: 'healthcare', label: 'HEALTHCARE', title: 'More time for people. Less friction for care teams.', text: 'Turn high-volume questions and fragmented internal knowledge into safe, guided experiences for staff and customers.', logos: ['Care navigation', 'Member support', 'Operations', 'Knowledge'], tone: 'mint' },
    { id: 'retail', label: 'RETAIL', title: 'Personal assistance across every retail moment.', text: 'Connect product knowledge, service policies, and operational workflows to create fast and dependable support.', logos: ['Commerce', 'Store teams', 'Service desk', 'Operations'], tone: 'lavender' },
    { id: 'telecom', label: 'TELECOM + MEDIA', title: 'Resolve the moments that matter at scale.', text: 'Give service teams a shared view of issues, actions, and answers across high-volume digital channels.', logos: ['Networks', 'Subscribers', 'Support', 'Field teams'], tone: 'sky' },
    { id: 'business', label: 'BUSINESS', title: 'Make enterprise work easier to find and finish.', text: 'Activate secure knowledge and workflows so people can move from question to outcome with less handoff.', logos: ['Finance', 'HR', 'IT', 'Legal'], tone: 'sand' }
  ],
  productTabs: [
    { id: 'prebuilt', label: 'PRE-BUILT APPLICATIONS' },
    { id: 'accelerators', label: 'APPLICATION ACCELERATORS' },
    { id: 'tailored', label: 'TAILORED APPLICATIONS' },
    { id: 'platform-tab', label: 'AGENT PLATFORM { ARTEMIS }' }
  ],
  applications: [
    { title: 'AI for Banking', accent: 'Banking', text: 'Coordinate self-service and agent support with shared context, consistency, and built-in compliance.', actions: [action('DISCUSS BANKING', emailTac('TAC AI for Banking enquiry'))] },
    { title: 'AI for Healthcare', accent: 'Healthcare', text: 'Enable 24/7 patient and member self-service and reduce staff burden with HIPAA-compliant intelligent assistance.', actions: [action('DISCUSS HEALTHCARE', emailTac('TAC AI for Healthcare enquiry'))] },
    { title: 'AI for Retail', accent: 'Retail', text: 'Frictionless shopping and optimized operations with instant, personalized support at every touchpoint.', actions: [action('DISCUSS RETAIL', emailTac('TAC AI for Retail enquiry'))] },
    { title: 'AI for IT', accent: 'IT', text: 'Resolve incidents, reduce ticket volume, and deliver 24/7 IT support.', actions: [action('DISCUSS IT', emailTac('TAC AI for IT enquiry'))] },
    { title: 'AI for HR', accent: 'HR', text: 'Automate, resolve, and reduce employee queries and manual workload.', actions: [action('DISCUSS HR', emailTac('TAC AI for HR enquiry'))] },
    { title: 'AI for Recruiting', accent: 'Recruiting', text: 'Automate screening, accelerate hiring, and engage top talent.', actions: [action('DISCUSS RECRUITING', emailTac('TAC AI for Recruiting enquiry'))] }
  ],
  accelerators: {
    title: 'Start faster with reusable building blocks.',
    lead: 'Bring proven AI patterns into new workflows with composable agents, templates, and integrations.',
    items: [
      ['Pre-built agents', 'Purpose-built starting points for common enterprise workflows.'],
      ['Templates', 'Structured patterns that make teams productive from day one.'],
      ['Integrations', 'Connect the knowledge and business systems your teams already use.']
    ]
  },
  tailored: [
    { title: 'AI for Service', text: 'Give customers and service teams clear, contextual support through every channel.', links: ['DISCUSS SERVICE'] },
    { title: 'AI for Work', text: 'Connect knowledge, systems, and people to remove the friction from daily enterprise work.', links: ['DISCUSS WORK'] }
  ],
  capabilities: [
    { id: 'build', label: 'Build with AI', headline: 'From idea to useful workflow — without a long runway.', text: 'Start from the business logic and move quickly toward a measurable, governed experience.', metric: 'FASTER STARTS' },
    { id: 'orchestrate', label: 'Orchestrate with AI', headline: 'Coordinate the workflows that do not fit in a simple chat.', text: 'Bring specialized agents, policies, and business systems together around one outcome.', metric: 'CONNECTED WORKFLOWS' },
    { id: 'prove', label: 'Prove with AI', headline: 'Make outcomes visible, not assumed.', text: 'Tie improvements to the workflows and decisions that produced them.', metric: 'CLEAR EVIDENCE' },
    { id: 'test', label: 'Test with AI', headline: 'Validate the experience before people depend on it.', text: 'Use controlled scenarios to refine quality, safety, and handoffs before rollout.', metric: 'FEWER SURPRISES' },
    { id: 'deploy', label: 'Deploy with AI', headline: 'Scale useful AI without scaling the complexity.', text: 'Move validated workflows into the channels where work already happens.', metric: 'READY TO OPERATE' },
    { id: 'govern', label: 'Govern with AI', headline: 'Keep every action understandable and accountable.', text: 'Apply guardrails and build an audit trail around the AI experiences that matter.', metric: 'GOVERNED BY DESIGN' },
    { id: 'scale', label: 'Scale with AI', headline: 'Create a foundation that can grow with the business.', text: 'Evolve models, tools, and workflows without rebuilding the operating layer.', metric: 'BUILT TO EVOLVE' },
    { id: 'simplify', label: 'Simplify with AI', headline: 'Bring scattered AI work into one operating model.', text: 'Reduce duplicate tooling and make workflows easier for teams to manage.', metric: 'ONE OPERATING VIEW' },
    { id: 'optimize', label: 'Optimize with AI', headline: 'Learn what works and make the next workflow better.', text: 'Use feedback and operational signals to focus effort where it changes outcomes.', metric: 'CONTINUOUS IMPROVEMENT' }
  ],
  reports: [
    { id: 'ai-readiness', label: 'AI READINESS', title: 'A practical framework for moving enterprise AI into operation.', text: 'Where to start, what to measure, and how to take AI from pilot to dependable production work.' },
    { id: 'service', label: 'SERVICE OPERATIONS', title: 'Designing high-confidence AI support experiences.', text: 'How leading service teams use governed AI to raise consistency without raising risk.' },
    { id: 'work', label: 'AI FOR WORK', title: 'How connected knowledge becomes measurable productivity.', text: 'Turning fragmented enterprise knowledge into outcomes teams can see and improve.' },
    { id: 'governance', label: 'GOVERNANCE', title: 'Operating AI with visibility, policy, and human control.', text: 'A working model for keeping every AI action understandable and accountable.' }
  ],
  skillsMarketplace: {
    eyebrow: 'SKILL MARKETPLACE',
    title: 'Discover skills that turn AI into useful work.',
    text: 'Explore public community skills for design, development, planning, and presentation workflows. Review each original source before you use it.',
    route: './pages/skills.html',
    featuredIds: ['frontend-design', 'skill-creator', 'ui-ux-pro-max']
  },
  partners: [
    { name: 'Technology ecosystem', text: 'A space for approved cloud, data, and enterprise software relationships that help TAC solutions fit into real operating environments.' },
    { name: 'Implementation ecosystem', text: 'A space for approved delivery and domain partners that extend TAC expertise into client programs.' }
  ],
  insights: [
    { tag: 'AI INSIGHT', date: 'JUN 2026', title: 'What makes an AI workflow operationally useful?', text: 'A practical look at moving enterprise AI from ambition to dependable, measurable work.' },
    { tag: 'OPERATIONS', date: 'JUL 2026', title: 'Where governed automation creates room for better decisions.', text: 'How guardrails and clear ownership turn automation into judgment the business can rely on.' },
    { tag: 'PLATFORM', date: 'AUG 2026', title: 'Designing AI systems that can evolve without losing control.', text: 'Patterns for building an AI operating layer that grows with the business, not against it.' }
  ]
};

// Reserved for internal visual comparison without mixing third-party copy into the page source.
export const internalReferenceContent = tacContent;
export const content = CONTENT_MODE === 'internal-reference' ? internalReferenceContent : tacContent;
