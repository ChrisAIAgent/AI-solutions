// Curated public examples. TAC does not distribute, install, or certify these skills.
// Keep the source repository visible so visitors can review the original project and license.
export const skills = [
  {
    id: 'frontend-design',
    name: 'Frontend Design',
    description: 'A practical starting point for distinctive, production-minded web interfaces and visual systems.',
    category: 'Design',
    author: 'Anthropic',
    sourceRepo: 'anthropics/skills',
    sourceUrl: 'https://github.com/anthropics/skills/tree/main/skills/frontend-design',
    license: 'See source repository',
    tags: ['UI', 'Web', 'Design'],
    featured: true,
    lastUpdated: '2026-09-03'
  },
  {
    id: 'skill-creator',
    name: 'Skill Creator',
    description: 'Guidance for shaping, testing, and refining reusable skills for AI workflows.',
    category: 'Development',
    author: 'Anthropic',
    sourceRepo: 'anthropics/skills',
    sourceUrl: 'https://github.com/anthropics/skills/tree/main/skills/skill-creator',
    license: 'See source repository',
    tags: ['Authoring', 'Evaluation', 'Agents'],
    featured: true,
    lastUpdated: '2026-04-20'
  },
  {
    id: 'ui-ux-pro-max',
    name: 'UI UX Pro Max',
    description: 'A broad design reference for planning interfaces, design direction, and polished user experiences.',
    category: 'Design',
    author: 'NextLevelBuilder',
    sourceRepo: 'nextlevelbuilder/ui-ux-pro-max-skill',
    sourceUrl: 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill',
    license: 'MIT',
    tags: ['UX', 'UI', 'Design Systems'],
    featured: true,
    lastUpdated: '2026-09-06'
  },
  {
    id: 'brainstorming',
    name: 'Brainstorming',
    description: 'A structured way to explore a problem, clarify intent, and turn an early idea into useful next steps.',
    category: 'Planning',
    author: 'obra',
    sourceRepo: 'obra/superpowers',
    sourceUrl: 'https://github.com/obra/superpowers',
    license: 'See source repository',
    tags: ['Ideation', 'Planning', 'Discovery'],
    featured: false,
    lastUpdated: '2026-08-12'
  },
  {
    id: 'vercel-react-best-practices',
    name: 'Vercel React Best Practices',
    description: 'A reference for improving React application quality, performance, and maintainability.',
    category: 'Development',
    author: 'Vercel Labs',
    sourceRepo: 'vercel-labs/agent-skills',
    sourceUrl: 'https://github.com/vercel-labs/agent-skills',
    license: 'See source repository',
    tags: ['React', 'Performance', 'Web'],
    featured: false,
    lastUpdated: '2026-04-14'
  },
  {
    id: 'presentation-generation',
    name: 'Presentation Generation',
    description: 'A public example for planning and producing presentation workflows with structured outputs.',
    category: 'Presentations',
    author: 'ByteDance',
    sourceRepo: 'bytedance/deer-flow',
    sourceUrl: 'https://github.com/bytedance/deer-flow',
    license: 'See source repository',
    tags: ['Slides', 'Storytelling', 'Documents'],
    featured: false,
    lastUpdated: '2026-03-16'
  }
];

export const skillCategories = ['All', ...new Set(skills.map((skill) => skill.category))];
