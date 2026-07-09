# Security Policy

VIMMaster is a static site with no accounts, no backend, and no personal data collection — but security still matters: we render user-importable data (progress codes), build HTML from content, and ship third-party dependencies.

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Instead:

- Use GitHub's **[private vulnerability reporting](../../security/advisories/new)** ("Report a vulnerability" on the Security tab), or
- Contact the maintainer directly via their GitHub profile ([@renzorlive](https://github.com/renzorlive)).

You can expect an acknowledgment within a few days. Please include reproduction steps and, if relevant, a crafted progress code or content file demonstrating the issue.

## Scope — things we care about

- XSS via imported progress codes, lesson/challenge content, or share-card data
- Malicious `lesson.json` files once the contributor playground ships
- Dependency vulnerabilities (once `package.json` exists — Dependabot will be enabled)
- Anything that could compromise a visitor's browser or localStorage beyond VIMMaster's own keys

## Out of scope

- Progress-code "cheating" (editing your own local save is a feature, not a vulnerability)
- Issues requiring a compromised browser or machine

Thank you for keeping learners safe. 🔒
