# TAC website knowledge index

The assistant searches public website content before asking the configured LLM to answer. It uses a local BM25 index and bilingual keyword aliases; no embedding service or vector database is required.

## Coverage and sources

`site-pages.js` is the shared list of published Vite pages. The index covers the homepage and all nine current secondary pages, including TACWork downloads, TAC Harness, TAC CLI, Plugins, Skills, Asset Lab, and Marketing Library pages.

- Homepage: `src/data/tac-home-content.js`, including a complete industry overview.
- Secondary pages: visible `<main>` content parsed with parse5, split into passages with page or section links.
- Plugins: the same `src/data/tac-plugins.json` catalog used by the directory.
- Skills: the same publishable `public/skill-artifacts/MANIFEST.json` entries used by the marketplace, with the UI's fallback catalog when no publishable manifest entries exist.
- TACWork availability: selected public release fields from the homepage data. Internal preview restrictions accompany TACWork answers. The activation key is never copied into the knowledge index.
- Asset Lab: the public asset inventory and motion-state metadata in its JSON manifests.

Navigation, forms, buttons, scripts, hidden content, private configuration, ZIP contents, installers, and external repositories are excluded. Catalog metadata describes community listings, not TAC-built integrations. An external link on the website does not cause that external website to be crawled.

## Updates

`npm run build` and Vite startup generate `server/generated/tac-site-knowledge.json`. Wrangler also regenerates it before bundling the Worker, including Git-triggered Cloudflare deployments. The generated JSON is checked in so a fresh checkout can import the Worker without starting Vite first. Its revision depends on content, not timestamps.

Run `npm run knowledge:build` to refresh the index manually during development. If a local Wrangler process is running, it reloads the changed generated module. Add new public HTML pages to `site-pages.js`; both the Vite build and the indexer then use them. For client-rendered pages, include their public data source in `scripts/build-assistant-index.js`, as for Skills and Plugins.

## Retrieval and answers

`server/tac-site-retrieval.js` ranks passages, expands common Chinese/English terms, and keeps product-specific questions within the named product pages. General industry questions include the complete sector list. Specific catalog queries use individual entries; broad catalog questions include the catalog overview. Unrelated queries with no evidence return a sales handoff.

The Worker sends up to five passages within a 9,000-character context budget to the existing LLM. Returned sources link to those passages' actual website pages or existing section anchors. The LLM is instructed to follow the question's language, preserve release limitations, and hand off when the excerpts do not support an answer.

This is lexical retrieval with aliases, so an unfamiliar paraphrase can still miss relevant material. Add aliases or improve source wording when those misses appear; the index does not automatically infer facts absent from the website.

## Checks

`node --test tests/tac-assistant.test.js tests/tac-site-knowledge.test.js` checks provider behavior, complete industry coverage, published-page coverage, extraction exclusions, catalog parity, bilingual retrieval, release restrictions, and Worker requests using secondary-page context.
