# Pull Request Review Skills

Use this guide when reviewing pull requests in this repository. Prioritize defects and risks introduced by the change; do not turn review into a general code-style audit.

## Review Workflow

1. Read the full diff and identify the intended behavior and affected user flows.
2. Trace changed client behavior through its API calls and server routes, models, and configuration where relevant.
3. Check edge cases, failure paths, data ownership, security boundaries, and compatibility with existing API contracts.
4. Run the narrowest relevant build or test available. Do not claim unrun checks passed.
5. Report actionable findings first, ordered by severity. If there are no findings, say so and note meaningful test gaps or residual risks.

## Severity

- **Critical:** Enables broad compromise, irreversible data loss, or makes a core production workflow unusable.
- **High:** Causes a serious security, data-integrity, or availability issue for common usage.
- **Medium:** Breaks a meaningful workflow or edge case with a practical workaround.
- **Low:** Causes a limited, non-blocking defect with little impact.

Assign severity based on actual impact and likelihood, not the size or complexity of the code change.

## Project Checks

### Client

- Verify loading, empty, error, and success states for asynchronous UI flows.
- Ensure forms validate input and prevent duplicate submissions where appropriate.
- Check that credentials and session cookies are sent only through intended API calls; never store passwords or session tokens in browser storage.
- Check responsive layout, keyboard access, labels, focus visibility, and accessible status/error announcements for changed UI.
- Confirm existing Todo interactions still behave correctly after authentication or state changes.

### Server and API

- Validate request input on the server; client-side validation is not a security boundary.
- Ensure authentication is required where intended and every database read or mutation is scoped to the authenticated account.
- Do not expose password hashes, tokens, secrets, database details, or internal exception messages in API responses or logs.
- Check status codes and response shapes against existing client expectations.
- Review concurrent operations for partial-failure behavior, duplicate effects, and unbounded workloads.
- Verify cookies, CORS, rate limits, and configuration are appropriate for the target environment.
- Check schema changes for existing-data migration implications, indexes, and validation behavior.

### Configuration and Builds

- Confirm environment-specific values are loaded at runtime when appropriate and secrets are not committed.
- Check UAT, QA, and production scripts still point to matching configuration and build outputs.
- Run `npm run build` in `server/` and `npm run build --prefix client` from the repository root when the respective areas change.
- Run relevant tests or lint commands if present; distinguish unavailable tests from passing tests.

## Finding Quality

- Report only actionable defects introduced by the pull request.
- Include the affected file and exact line, the triggering conditions, the user or system impact, and a concise fix direction.
- Prefer one finding per distinct issue; avoid duplicating the same root cause across multiple symptoms.
- Do not report speculative concerns without a concrete code path or reproducible consequence.
- Keep summaries and praise secondary to findings.

## Suggested Output

### Findings

- **[High] Short title** — `path/to/file.ts:line`. Explain when the issue occurs and its impact, then suggest a correction.

### Checks

- List the builds, tests, or lint commands run and their outcomes.
- Note important untested paths or assumptions.

When no actionable issues are found, state that explicitly under **Findings** and include remaining test gaps under **Checks**.