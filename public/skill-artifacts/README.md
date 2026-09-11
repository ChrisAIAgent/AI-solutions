# TAC Skill artifacts

This directory is the Git-managed publishing location for Skill packages shown in the TAC Skill Hub.

## Add a Skill

Use one versioned directory per Skill:

```text
public/skill-artifacts/<skill-id>/<version>/<skill-id>.zip
```

The zip should contain a Skill directory with a `SKILL.md` file:

```text
<skill-id>/
└─ SKILL.md
```

For a simple Skill, a standalone file may also be published:

```text
public/skill-artifacts/<skill-id>/<version>/SKILL.md
```

For the secondary Skill Hub, update `MANIFEST.json` in this directory. The page reads that manifest at runtime, so all versioned packages listed there appear automatically after a refresh. The legacy `src/data/tac-skills.js` catalog is only used as a fallback and for the homepage preview.

Each manifest entry should include:

- `distribution: 'tac-hosted'`
- `trust: 'tac-authored'` for TAC-owned Skills, or `community-curated` for reviewed public packages
- `version`
- `artifactType` (`'zip'` or `'md'`)
- `artifactUrl`
- `sha256`
- `minTacWorkVersion`

Test the package by downloading it from the local Skill Hub and importing it in TACWork before publishing.
