# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

- Shopify Online Store 2.0 theme based on Dawn v16 (plain Liquid/CSS/JS, no build step).
- Connected to a Shopify development store via GitHub sync: commits on `main` sync to the store, and Theme Editor changes can sync back as commits.
- The store will become an international webshop for curated vintage and pre-owned designer items.
- The current store name is a working title only; the final brand name has not been chosen yet.

## Directory structure

- `assets/` — all CSS and JS, one flat directory; per-component files loaded only where used.
- `config/` — `settings_schema.json` (theme settings definitions) and `settings_data.json` (merchant's values).
- `layout/` — `theme.liquid` HTML shell for every page, plus `password.liquid`.
- `locales/` — storefront translations (`*.json`) and Theme Editor strings (`*.schema.json`).
- `sections/` — merchant-configurable building blocks, each ending in a `{% schema %}` JSON block.
- `snippets/` — reusable partials included with `{% render %}`.
- `templates/` — JSON templates composing sections per page type (only `gift_card.liquid` is Liquid).

## Non-negotiable rules

- Never modify `config/settings_data.json` without the user's explicit permission in the current task; treat it as store state managed by Shopify and the Theme Editor.
- Never modify or publish the live Shopify theme on your own.
- Never force-push, run destructive Git commands, or discard existing changes.
- Never commit API keys, tokens, passwords, or other secrets.
- Do not change products, prices, inventory, orders, blogs, or Shopify pages from this theme repository.
- Do not hardcode a final brand name, domain, or logo while the brand name is undecided.
- Prefer Shopify settings, blocks, metafields, and locale files over hardcoded content.

## Git workflow

- Future functional changes go on a separate feature branch; never commit or push directly to `main` without an explicit instruction.
- One task = one logically scoped change; keep unrelated changes out of the commit.
- Always review the diff and `git status` before delivering.
- Never publish to Shopify automatically.
- One-time exception: the documentation commit that established this file was allowed directly on `main`.

## Multi-agent coordination

ChatGPT/Codex also actively works on this website. Claude Code and Codex must treat the GitHub remote—not an earlier chat, local checkout or handoff report—as the source of truth.

At the start of every task:

- Run `git fetch origin --prune`, then read both `CLAUDE.md` and `AGENTS.md`.
- Record the current branch, `origin/main` commit SHA and `git status`; inspect the recent `origin/main` log and all open pull requests.
- Check whether another agent branch or pull request touches the same files. Do not duplicate or overwrite concurrent work.
- Start from the latest `origin/main` on a unique task branch. Never continue an old branch without first comparing it with current `origin/main`.
- Remember that Shopify Theme Editor or GitHub sync can create legitimate commits on `main`; preserve and investigate unfamiliar changes.

Immediately before committing and again before requesting a merge:

- Fetch the remote again and compare the task branch with current `origin/main`.
- If `main` or overlapping files changed, inspect and reconcile safely; stop and ask the user when intent is ambiguous.
- Never force-push or rewrite another agent's branch.
- Report the base SHA, head SHA, branch, files changed, validations run, open-PR status and any unresolved overlap.

## Technical quality

Every future change must:

- preserve existing Dawn functionality and Shopify Theme Editor compatibility;
- work responsively on mobile, tablet, and desktop;
- respect accessibility, semantic HTML, and keyboard operation;
- not needlessly degrade performance (Dawn targets zero CLS, no render-blocking JS);
- avoid unnecessary external libraries — Dawn is web-native by principle;
- be validated with Shopify Theme Check (`shopify theme check`) after relevant changes;
- not duplicate functionality Dawn already provides reliably.

## Brand identity

Refer to the project as "the brand" or "the store" — never invent a name.

- **Category:** curated vintage and pre-owned luxury, initially focused on authenticated designer handbags.
- **Positioning:** a specialized luxury curator — not a thrift store, discounter, or busy marketplace.
- **Feel:** refined, timeless, editorial, warm, exclusive, and trustworthy.
- **Inspiration:** international luxury fashion with a subtle European and North African sensibility.
- **Visual:** calm compositions, generous whitespace, strong product photography, understated luxury.
- **Provisional color world:** ivory, warm stone, taupe, espresso, and deep black, with at most one muted accent color. Do not commit to final color codes yet.
- **Typography:** an elegant editorial serif for character, paired with a highly readable sans-serif for navigation and product information.
- **Imagery:** authentic product shots, detail photos, and honest representation of condition and wear; avoid heavy retouching and generic stock imagery.
- **UX:** product-first, calm, and uncluttered; avoid loud banners, fake scarcity, excessive pop-ups, and discount aesthetics.
- **Trust:** clearly explain authenticity, condition, provenance where known, shipping, returns, and secure payment.
- **Tone of voice:** knowledgeable, calm, personal, and confident — never exaggerated, clichéd, or obviously AI-written.
- **Language strategy:** English is the source language for new international content; Dutch is fully maintained as a translation; the structure must support later expansion to German and French.
- **Terminology:** use "pre-owned", "vintage", "archive", and "authenticated" precisely; do not lean on "pre-loved" as a marketing cliché.
- The final name, logo, exact colors, fonts, and tagline will be decided later and must not be invented or hardcoded.
