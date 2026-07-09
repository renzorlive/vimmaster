# SEO Strategy

VIMMaster competes for queries like *learn vim*, *vim tutorial*, *vim game*, *vim practice online*, *how to exit vim*. It is a static, fast site — structurally ideal for SEO — but currently ships almost no metadata.

## Current state audit

| Item | Status |
|---|---|
| Title | ⚠️ "VIM Master Game" (weak; no keywords, same everywhere) |
| Meta description | ❌ none |
| Open Graph / Twitter cards | ❌ none (shares render as bare links — painful for a project with a sharing feature) |
| Favicon link | ❌ `images/favicon.ico` exists but no `<link rel="icon">` |
| Canonical URL | ❌ none (site is served from at least two origins: github.io + Cloudflare — duplicate-content risk) |
| robots.txt / sitemap.xml | ❌ none |
| Structured data | ❌ none |
| Crawlable text content | ⚠️ minimal — page is UI, near-zero indexable prose |
| Headings | ⚠️ single `<h1>` is decorative ("VIM Master"), placed mid-page |
| Performance | ⚠️ Tailwind CDN is render-blocking ~300 KB (also a Core Web Vitals issue) |
| Mobile | ⚠️ playable-ish; viewport tag present |

## Phase 0 — metadata quick wins (an afternoon, zero risk)

`index.html`:

```html
<title>VIM Master — Learn Vim Interactively, Free in Your Browser</title>
<meta name="description" content="Learn Vim the fun way: 16 interactive levels, speed challenges, and a built-in cheat sheet. Free, open source, no signup — plays entirely in your browser.">
<link rel="canonical" href="https://renzorlive.github.io/vimmaster/">
<link rel="icon" href="images/favicon.ico">

<meta property="og:type" content="website">
<meta property="og:title" content="VIM Master — Learn Vim Interactively">
<meta property="og:description" content="Master Vim through interactive levels, timed challenges, and instant practice. Free & open source.">
<meta property="og:image" content="https://renzorlive.github.io/vimmaster/images/vmrf.png">
<meta property="og:url" content="https://renzorlive.github.io/vimmaster/">
<meta name="twitter:card" content="summary_large_image">
```

Equivalent (distinct) title/description for `profile.html` + `noindex` consideration (it's personal-state UI; `noindex, follow` is reasonable).

Also:
- `robots.txt` allowing all + sitemap pointer; `sitemap.xml` with the two pages (grow later).
- Pick **one canonical origin** (recommend the eventual custom domain, else github.io) and 301/`link rel=canonical` from the other.
- JSON-LD structured data:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "VIM Master",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Any (Web)",
  "offers": { "@type": "Offer", "price": "0" },
  "description": "Interactive browser game that teaches Vim motions and editing commands.",
  "url": "https://renzorlive.github.io/vimmaster/"
}
</script>
```

## Phase 1 — technical SEO via the build migration

- Replace Tailwind CDN with compiled CSS (largest LCP win available).
- Preload the editor font if a webfont is adopted; currently local fallbacks — fine.
- Keep everything statically rendered: the game shell + an indexable prose section must exist in HTML, not injected by JS.
- Add an on-page crawlable content block (below the fold): what VIMMaster is, what you'll learn, level list as real text. Right now a crawler sees almost no words; a ~300-word semantic section with `<h2>`s ("Learn Vim commands interactively", "16 progressive lessons", "Practice speed challenges") fixes that without touching gameplay.
- Lighthouse CI budget in GitHub Actions guards regressions (ContributingVision.md).

## Phase 2 — programmatic content pages (the growth engine)

Once content is data (ContentSystem.md), generate a static page per command and per lesson at build time:

```
/commands/dd     "dd — delete line in Vim"     ← explainer + playable mini-lesson embed
/commands/cw
/lessons/basics/exiting-vim   "How to exit Vim (interactive lesson)"
```

- Each page: unique title/description, prose explanation, examples, the interactive embed, links to related commands (internal linking mesh), JSON-LD `LearningResource`.
- *"how to exit vim"* alone is a massive evergreen query the level-1 lesson is literally built for — that page should exist and be excellent.
- These pages are generated from the same JSON contributors write — SEO grows automatically with content, no separate authoring.

## Phase 3 — off-page & distribution

- Custom domain (e.g. `vimmaster.dev`) — consolidates signals and enables Cloudflare fully; set canonical + redirects from github.io.
- Submit to: awesome-vim lists, r/vim & r/neovim (show-and-tell tone), Hacker News (post when text objects/golf mode ship — needs a hook), vim.fandom / Neovim wiki external-resources pages, alternativeto (Vim Adventures alternative — a real query).
- The share-card feature already emits links; ensure shared URLs carry OG tags (Phase 0) so every player share is a well-rendered backlink.
- Embeddable lesson widget (FeatureIdeas.md) turns blog embeds into backlinks.

## Measurement

- Google Search Console + Bing Webmaster (verify via meta tag, static-friendly).
- Privacy-respecting analytics if any (Cloudflare Web Analytics / Plausible) — no cookies, aligned with the no-tracking ethos; or none at all and rely on Search Console.
- KPI order: indexed pages → impressions on command queries → clicks → returning users (streak feature ties in).
