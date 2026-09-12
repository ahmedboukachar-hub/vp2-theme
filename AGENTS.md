# AGENTS.md

This file governs ChatGPT/Codex work in this repository.

## Required project instructions

- Read `CLAUDE.md` completely before every task. Its project overview, guardrails, Git workflow, technical-quality rules and brand guidance also apply to Codex.
- Never modify `config/settings_data.json` without the user's explicit permission in the current task.
- Never publish the Shopify theme, change Shopify Admin data, force-push, discard unfamiliar changes or commit secrets without explicit authorization.
- Use a separate, logically scoped feature branch and keep unrelated work out.

## Shared-agent workflow

Claude Code and ChatGPT/Codex both work on this website. GitHub is the source of truth; no agent may assume that an earlier session, local checkout, screenshot or handoff report reflects the latest state.

Before editing:

1. Run `git fetch origin --prune`.
2. Record the current branch, `origin/main` SHA and `git status`.
3. Read `CLAUDE.md` and this file.
4. Inspect recent commits on `origin/main`, open pull requests and active branches.
5. Check whether another branch or PR touches the intended files.
6. Start a unique task branch from the latest `origin/main`.

Before committing and before requesting a merge:

1. Fetch again and compare against current `origin/main`.
2. Review the complete diff and preserve all user, Shopify-sync and other-agent changes.
3. If `main` or an overlapping file moved during the task, reconcile safely; ask the user if intent is unclear.
4. Never force-push or rewrite another agent's history.
5. Report base SHA, head SHA, branch, files changed, validation results, PR status and remaining conflicts or decisions.

Shopify Theme Editor changes can arrive on `main` through GitHub sync. Treat unfamiliar remote changes as legitimate until verified otherwise.
