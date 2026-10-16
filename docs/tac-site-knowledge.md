# TAC website knowledge index

The assistant searches public website content before asking the configured LLM to answer. It uses a local BM25 index and bilingual keyword aliases; no embedding service or vector database is required.

## Coverage and sources

`site-pages.js` is the shared list of published Vite pages. The index covers the homepage and all nine current secondary pages, including TACWork downloads, TAC Harness, TAC CLI, Plugins, Skills, Asset Lab, and Marketing Library pages.

- Homepage: `src/data/tac-home-content.js`, including a complete industry overview.
- Secondary pages: visible `<main>` content parsed with parse5, split into passages with page or section links.
- Plugins: the same `src/data/tac-plugins.json` catalog used by the directory.
- Skills: the same publishable `public/skill-artifacts/MANIFEST.json` entries used by the marketplace, with the UI's fallback catalog when no publishable manifest entries exist.
- TACWork availability: selected public release fields from the homepage data. Download Key verification happens on the official TACWork download page; the Key is never copied into the knowledge index.
- Asset Lab: the public asset inventory and motion-state metadata in its JSON manifests.

Navigation, forms, buttons, scripts, hidden content, private configuration, ZIP contents, installers, and external repositories are excluded. Catalog metadata describes community listings, not TAC-built integrations. An external link on the website does not cause that external website to be crawled.

## Updates

`npm run build` and Vite startup generate `server/generated/tac-site-knowledge.json`. Wrangler also regenerates it before bundling the Worker, including Git-triggered Cloudflare deployments. The generated JSON is checked in so a fresh checkout can import the Worker without starting Vite first. Its revision depends on content, not timestamps.

Run `npm run knowledge:build` to refresh the index manually during development. If a local Wrangler process is running, it reloads the changed generated module. Add new public HTML pages to `site-pages.js`; both the Vite build and the indexer then use them. For client-rendered pages, include their public data source in `scripts/build-assistant-index.js`, as for Skills and Plugins.

## Retrieval and answers

`server/tac-site-retrieval.js` ranks passages, expands common Chinese/English terms, and keeps product-specific questions within the named product pages. General industry questions include the complete sector list. Specific catalog queries use individual entries; broad catalog questions include the catalog overview. Unrelated queries with no evidence return a sales handoff.

The Worker sends retrieved passages and a compact website overview within a 9,000-character context budget to the existing LLM. It returns structured answers and validates source IDs against the supplied evidence before linking to website pages. The LLM follows the question's language and preserves release limitations.

Greetings, thanks and goodbye have natural replies without retrieval. Other questions always reach the LLM with website overview evidence, even when lexical retrieval has no matches. Recent conversation also helps retrieve follow-up context. A first-pass handoff gets one semantic recovery attempt: the LLM rewrites standalone search queries using the website catalog and recent conversation, then answers from refreshed evidence. This needs no embedding model. The search and answer calls share the existing 45-second provider budget. A timeout in the optional search stage preserves the first answer instead of turning it into a connection error.

Only the latest six conversation messages are sent, with each message limited to 480 characters. History stays in browser memory and is used to resolve references, not as verified product facts. Clarifications and unrelated requests do not trigger sales; a concrete unavailable TAC fact or an explicit sales request can offer contact. No-answer no longer automatically changes the frontend to the Sales state.

## Checks

`node --test tests/tac-assistant.test.js tests/tac-site-knowledge.test.js tests/tac-assistant-conversation.test.js` checks provider behavior, complete industry coverage, published-page coverage, extraction exclusions, catalog parity, bilingual retrieval, release restrictions, semantic recovery, normal conversation, follow-up context, and source validation.
