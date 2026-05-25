---
name: Use pnpm as package manager
description: User prefers pnpm over npm for this project
type: feedback
---

Always use pnpm instead of npm for installing packages and running scripts in PixResize.

**Why:** User preference — project is configured to use pnpm as the package manager.

**How to apply:** Use `pnpm install`, `pnpm add`, `pnpm run` instead of npm equivalents. The package.json `packageManager` field is set to pnpm.
