// TAC home page content is deliberately centralized so the internal preview
// structure can later be swapped for approved production copy without DOM edits.
// Local-only visual alignment mode. Switch to `tac` before any public build.
export const CONTENT_MODE = 'tac';

const action = (label, href = '#contact') => ({ label, href });

export const tacContent = {
  download: {
    product: 'TACWork',
    version: '0.19.1',
    platform: 'Windows x64',
    available: false,
    artifact: '../downloads/tacwork-win-x64-0.19.1-rc.1.exe',
    label: 'Download for Windows',
    navLabel: 'Download TACWork',
    fileName: 'tacwork-win-x64-0.19.1-rc.1.exe',
    fileSize: '198 MB',
    checksum: '1CBA01573DCD7AC2CD0D2235D1A93591A505727FC5E48201BDE812E27065E8CE'
  },
  nav: [
    { label: 'Agent Platform', target: '#platform', items: ['Build with confidence', 'Orchestrate workflows', 'Govern every action'] },
    { label: 'Agentic AI Apps', target: '#applications', items: ['Pre-built applications', 'Application accelerators', 'Tailored applications'] },
    { label: 'Agent Marketplace', target: '#accelerators', items: ['Agents', 'Templates', 'Integrations'] },
    { label: 'More', target: '#insights', items: ['Industry insights', 'Partner ecosystem', 'Contact TAC'] }
  ],
  hero: {
    eyebrow: 'TAC AI PLATFORM',
    title: 'Build AI operations that move with your business.',
    lead: 'TAC brings intelligent automation, connected knowledge, and governed AI workflows together for teams ready to operate at scale.',
    primary: action('GET A DEMO'),
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
    { title: 'AI for Banking', accent: 'Banking', text: 'Coordinate self-service and agent support with shared context, consistency, and built-in compliance.', actions: [action('LEARN MORE'), action('GUIDE: BANKING')] },
    { title: 'AI for Healthcare', accent: 'Healthcare', text: 'Enable 24/7 patient and member self-service and reduce staff burden with HIPAA-compliant intelligent assistance.', actions: [action('LEARN MORE'), action('GUIDE: HEALTHCARE')] },
    { title: 'AI for Retail', accent: 'Retail', text: 'Frictionless shopping and optimized operations with instant, personalized support at every touchpoint.', actions: [action('LEARN MORE'), action('GUIDE: RETAIL')] },
    { title: 'AI for IT', accent: 'IT', text: 'Resolve incidents, reduce ticket volume, and deliver 24/7 IT support.', actions: [action('LEARN MORE')] },
    { title: 'AI for HR', accent: 'HR', text: 'Automate, resolve, and reduce employee queries and manual workload.', actions: [action('LEARN MORE')] },
    { title: 'AI for Recruiting', accent: 'Recruiting', text: 'Automate screening, accelerate hiring, and engage top talent.', actions: [action('LEARN MORE')] }
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
    { title: 'AI for Service', text: 'Give customers and service teams clear, contextual support through every channel.', links: ['EXPLORE SERVICE', 'SERVICE BRIEF'] },
    { title: 'AI for Work', text: 'Connect knowledge, systems, and people to remove the friction from daily enterprise work.', links: ['EXPLORE WORK', 'WORKFLOW GUIDE'] }
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
  testimonials: [
    { company: 'Global financial services group', quote: '“TAC gave our service teams one consistent source of context, so every customer conversation starts from the same place.”', person: 'VP, Customer Operations', role: 'Banking' },
    { company: 'Regional health system', quote: '“We turned high-volume member questions into guided, safe answers — without adding to our care teams’ daily load.”', person: 'Director of Member Experience', role: 'Healthcare' },
    { company: 'Enterprise technology team', quote: '“TAC took us from disconnected pilots to one operating model our teams can actually trust.”', person: 'Head of AI Platform', role: 'Enterprise technology' }
  ],
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
