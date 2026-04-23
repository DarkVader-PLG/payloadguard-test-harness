# PayloadGuard Test Harness — Branch Specification

**Version:** 1.0  
**Repo:** `payloadguard-test-harness`  
**Reports land in:** `payload-consequence-analyser/test-reports/runs/`

---

## How to Read This Document

Each branch is a controlled PR against `main`. For each:

- **What changes** — exactly what files/lines are modified
- **Layers expected to fire** — which of the 5 layers should trigger
- **Expected verdict** — SAFE / REVIEW / CAUTION / DESTRUCTIVE
- **Consistency target** — same branch scanned 3x should return identical verdict
- **Notes** — edge case rationale or known limitations

---

## Track 1 — Validation Branches

*These confirm PayloadGuard behaves as designed. All verdicts should be stable and repeatable.*

---

### T01 — `safe/small-additive`

| Field | Value |
|---|---|
| **Purpose** | Baseline clean pass — nothing fires |
| **Change** | Add 1 new function `health_check()` to `src/auth.py` (+8 lines) |
| **PR description** | "Add health check endpoint to auth module" |
| **Layers expected to fire** | None |
| **Expected verdict** | ✅ SAFE [LOW] |
| **Consistency target** | 3/3 identical |
| **Notes** | Establishes the zero-noise baseline. If this returns anything other than SAFE, something is wrong. |

---

### T02 — `safe/docs-only`

| Field | Value |
|---|---|
| **Purpose** | Documentation change — no structural impact |
| **Change** | Update `README.md` only (+15 lines, 0 deletions) |
| **PR description** | "Update README with installation instructions" |
| **Layers expected to fire** | None |
| **Expected verdict** | ✅ SAFE [LOW] |
| **Consistency target** | 3/3 identical |
| **Notes** | Confirms non-code changes don't trigger false positives |

---

### T03 — `destructive/mass-deletion`

| Field | Value |
|---|---|
| **Purpose** | Classic destructive merge — all layers fire |
| **Change** | Delete `src/auth.py`, `src/database.py`, `tests/test_auth.py`, `tests/test_database.py`, `config/settings.yml` (5 files, ~250 lines) |
| **PR description** | "Remove legacy authentication and database modules" |
| **Layers expected to fire** | L1 (file count), L2 (critical paths: tests, config), L3 (consequence), L4 (structural nodes gone) |
| **Expected verdict** | ❌ DESTRUCTIVE [CRITICAL] |
| **Consistency target** | 3/3 identical |
| **Notes** | Most signals fire simultaneously. Strong test of score accumulation. |

---

### T04 — `destructive/april-2026-replica`

| Field | Value |
|---|---|
| **Purpose** | Exact replica of the incident that motivated PayloadGuard |
| **Change** | Replace entire contents of `src/auth.py` and `src/database.py` with stubs (~200 lines deleted, ~10 added). Branch dated 300+ days old. |
| **PR description** | "Minor syntax fix in user module" |
| **Layers expected to fire** | L1 (deletion ratio ~95%), L3 (consequence), L4 (structural nodes gone), L5a (temporal — drift score ~1500), L5b (semantic — "minor syntax fix" vs CRITICAL) |
| **Expected verdict** | ❌ DESTRUCTIVE [CRITICAL] |
| **Consistency target** | 3/3 identical |
| **Notes** | The canonical case. All 5 layers should fire. Deceptive description makes L5b flag DECEPTIVE_PAYLOAD. |

---

### T05 — `boundary/structural-threshold`

| Field | Value |
|---|---|
| **Purpose** | Test exactly at the 20% structural deletion threshold |
| **Change** | In `src/auth.py` (10 structural nodes total): delete exactly 2 methods (20%) |
| **PR description** | "Remove deprecated session methods" |
| **Layers expected to fire** | L4 (just at threshold) |
| **Expected verdict** | ⚠️ CAUTION or → REVIEW [depends on other signals] |
| **Consistency target** | 3/3 identical verdict AND identical score |
| **Notes** | Critical boundary test. Run this 5x not 3x. Any variance in score is a consistency bug. |

---

### T06 — `boundary/temporal-warning`

| Field | Value |
|---|---|
| **Purpose** | Test at exactly the temporal WARNING threshold (drift score 250) |
| **Change** | Trivial change (+1 line comment) on a branch created to simulate 50 days old on a repo at 5 commits/day |
| **PR description** | "Add inline comment to utils" |
| **Layers expected to fire** | L5a (drift score = 250, STALE/WARNING) |
| **Expected verdict** | → REVIEW [MEDIUM] |
| **Consistency target** | 3/3 identical |
| **Notes** | Isolates temporal layer. Other layers should be silent. |

---

### T07 — `boundary/temporal-critical`

| Field | Value |
|---|---|
| **Purpose** | Test at exactly the temporal CRITICAL threshold (drift score 1000) |
| **Change** | Trivial change (+1 line comment) simulating 100 days old at 10 commits/day |
| **PR description** | "Add inline comment to utils" |
| **Layers expected to fire** | L5a (drift score = 1000, DANGEROUS/CRITICAL) |
| **Expected verdict** | ⚠️ CAUTION [HIGH] |
| **Consistency target** | 3/3 identical |
| **Notes** | Temporal layer alone at critical. Change is genuinely harmless — tests whether temporal signal alone escalates correctly. |

---

### T08 — `mixed/stale-branch-tiny-change`

| Field | Value |
|---|---|
| **Purpose** | Old branch, harmless change — should flag temporal but not structural |
| **Change** | Fix a typo in a docstring. Branch is 200 days old. |
| **PR description** | "Fix typo in docstring" |
| **Layers expected to fire** | L5a (temporal — STALE) |
| **Expected verdict** | → REVIEW [MEDIUM] |
| **Consistency target** | 3/3 identical |
| **Notes** | Tests that a stale branch with minimal change doesn't over-escalate. Verdict should be proportionate. |

---

### T09 — `semantic/no-description`

| Field | Value |
|---|---|
| **Purpose** | Empty PR description — UNVERIFIED path |
| **Change** | Delete `src/database.py` (significant change) |
| **PR description** | *(empty)* |
| **Layers expected to fire** | L1, L2, L3, L4, L5b (UNVERIFIED — no description to analyse) |
| **Expected verdict** | ❌ DESTRUCTIVE [CRITICAL] |
| **Consistency target** | 3/3 identical |
| **Notes** | Confirms empty description returns UNVERIFIED not a crash. Destructive verdict should still fire from other layers. |

---

### T10 — `semantic/honest-critical`

| Field | Value |
|---|---|
| **Purpose** | Honest description of a genuinely destructive change |
| **Change** | Delete `src/auth.py` entirely |
| **PR description** | "BREAKING CHANGE: Remove Auth module — replaced by external OAuth provider" |
| **Layers expected to fire** | L1, L2, L3, L4 — L5b should return TRANSPARENT |
| **Expected verdict** | ❌ DESTRUCTIVE [CRITICAL] |
| **Consistency target** | 3/3 identical |
| **Notes** | Confirms L5b doesn't reduce severity for honest PRs — TRANSPARENT means the description matches, not that the change is safe. |

---

### T11 — `multilang/structural-js-ts-go`

| Field | Value |
|---|---|
| **Purpose** | Stress test structural parser across all non-Python languages |
| **Change** | Delete `fetchUser`, `createUser` from `api.js`; delete `UserService` from `services.ts`; delete `NewServer`, `HandleRequest` from `utils.go` |
| **PR description** | "Remove unused API and server utilities" |
| **Layers expected to fire** | L4 (structural — JS, TS, Go nodes all deleted) |
| **Expected verdict** | ⚠️ CAUTION or ❌ DESTRUCTIVE |
| **Consistency target** | 3/3 identical |
| **Notes** | First real test of multi-language structural parser in a live CI context. Watch for silent failures where nodes aren't detected. |

---

## Track 2 — Adversarial Branches

*These are designed to probe limitations. Results are documented as known boundaries — not bugs — unless PayloadGuard catches them unexpectedly.*

---

### A01 — `adversarial/keyword-evasion`

| Field | Value |
|---|---|
| **Purpose** | Deceptive description that avoids all benign keywords |
| **Change** | Delete `src/auth.py` entirely (~120 lines) |
| **PR description** | "Architectural consolidation: centralising identity management into the new OAuth gateway layer" |
| **Layers expected to fire** | L1, L2, L3, L4 — L5b should return TRANSPARENT (no keyword match) |
| **Expected verdict** | ❌ DESTRUCTIVE [CRITICAL] |
| **Known limitation** | L5b misses this — keyword matching only, no NLP. Documented as known gap. |
| **Notes** | The description is deceptive but uses no trigger words. Tests whether other layers compensate. |

---

### A02 — `adversarial/rename-smuggling`

| Field | Value |
|---|---|
| **Purpose** | Destructive changes hidden in renamed files (change_type = R) |
| **Change** | Rename `src/auth.py` → `src/identity.py` with contents gutted (all classes removed) |
| **PR description** | "Rename auth module to identity for consistency" |
| **Layers expected to fire** | L1 (rename count), L5b (description seems benign) |
| **Expected verdict** | → REVIEW or ⚠️ CAUTION |
| **Known limitation** | L4 does not analyse renamed files — structural gutting is invisible to structural drift detection. |
| **Notes** | Documents the renamed-file blind spot from the whitepaper. |

---

### A03 — `adversarial/slow-deletion`

| Field | Value |
|---|---|
| **Purpose** | Mass deletion spread thinly to stay under per-file thresholds |
| **Change** | Delete 1 function each from `auth.py`, `database.py`, `api.js`, `services.ts`, `utils.go` — no single file crosses 20% structural threshold |
| **PR description** | "Remove deprecated utility functions across modules" |
| **Layers expected to fire** | Possibly none at high severity |
| **Expected verdict** | ✅ SAFE or → REVIEW |
| **Known limitation** | Per-file structural scoring doesn't accumulate cross-file. Distributed deletion evades detection. |
| **Notes** | One of the most realistic attack vectors. Documents cross-file accumulation gap. |

---

### A04 — `adversarial/addition-camouflage`

| Field | Value |
|---|---|
| **Purpose** | Large addition masks large deletion — ratio looks safe |
| **Change** | Add 200 lines of new boilerplate to `src/api.js`, simultaneously delete `src/auth.py` (120 lines) |
| **PR description** | "Expand API module with new endpoints" |
| **Layers expected to fire** | L1 (deleted files), L2 (critical path), L3, L4 |
| **Expected verdict** | ⚠️ CAUTION or ❌ DESTRUCTIVE |
| **Notes** | Deletion ratio will be low (~37%) because of the large addition. Tests whether file-level signals compensate for ratio camouflage. |

---

### A05 — `adversarial/nested-gutting`

| Field | Value |
|---|---|
| **Purpose** | Top-level class preserved, all methods inside deleted |
| **Change** | In `src/auth.py`: keep `class Auth` but delete all methods inside it (`login`, `logout`, `register`, `authenticate`, `deactivate`) |
| **PR description** | "Refactor Auth class interface" |
| **Layers expected to fire** | L4 (methods are tracked as structural nodes) |
| **Expected verdict** | ⚠️ CAUTION or ❌ DESTRUCTIVE |
| **Notes** | Tests whether method-level deletion inside a class is caught. PayloadGuard tracks methods — this should fire. Documents behaviour clearly either way. |

---

### A06 — `adversarial/threshold-gaming`

| Field | Value |
|---|---|
| **Purpose** | Every metric tuned to sit just below every threshold |
| **Change** | Branch 89 days old. Delete 9 files. Deletion ratio 49%. Structural deletion 19%. Drift score 249. |
| **PR description** | "General codebase maintenance" |
| **Layers expected to fire** | None — every metric is sub-threshold |
| **Expected verdict** | ✅ SAFE [LOW] — severity score 0 |
| **Known limitation** | A sophisticated attacker who knows the thresholds can game every metric simultaneously. |
| **Notes** | The most important adversarial case. Documents that threshold-based systems have a known gaming vector. Mitigation path: composite scoring or ML-based thresholds. |

---

### A07 — `adversarial/new-file-replacement`

| Field | Value |
|---|---|
| **Purpose** | Nothing deleted — old files replaced by new files with destructive content |
| **Change** | Delete `src/auth.py`, add `src/auth_v2.py` with 5 lines replacing 120. Net: additions > deletions. |
| **PR description** | "Upgrade auth module to v2" |
| **Layers expected to fire** | L1 (deleted file), L2 (critical path), L3 |
| **Expected verdict** | ⚠️ CAUTION or ❌ DESTRUCTIVE |
| **Notes** | Tests whether delete+add pattern (rather than modify) is caught. L4 won't compare old→new across different filenames. |

---

### A08 — `adversarial/empty-diff`

| Field | Value |
|---|---|
| **Purpose** | PR opened with no actual changes — empty diff |
| **Change** | Branch created from HEAD with no commits beyond it |
| **PR description** | "Preparing for upcoming changes" |
| **Layers expected to fire** | None |
| **Expected verdict** | ✅ SAFE [LOW] |
| **Notes** | Tests graceful handling of zero-diff PRs. Should not crash or produce misleading output. |

---

### A09 — `adversarial/config-only-deletion`

| Field | Value |
|---|---|
| **Purpose** | Delete only config and CI files — no source code touched |
| **Change** | Delete `config/settings.yml`, `.github/workflows/` (if present) |
| **PR description** | "Remove unused configuration files" |
| **Layers expected to fire** | L2 (critical path patterns: config, .yml) |
| **Expected verdict** | → REVIEW or ⚠️ CAUTION |
| **Notes** | Tests whether config-only deletions are treated as critical. No structural nodes affected — pure L2 signal. |

---

### A10 — `adversarial/unicode-payload`

| Field | Value |
|---|---|
| **Purpose** | Malformed or unusual encoding in file content |
| **Change** | Modify `src/auth.py` to include null bytes, non-UTF8 sequences, or right-to-left override characters in comments |
| **PR description** | "Update auth module comments" |
| **Layers expected to fire** | Potentially none — or a graceful error |
| **Expected verdict** | ✅ SAFE or graceful error — no crash |
| **Notes** | Tests robustness of blob reading and AST parsing against hostile encoding. The `errors='ignore'` in blob reading should handle this — confirms it does. |

---

## Consistency Protocol

Each branch is scanned a minimum of **3 times**. For boundary cases (T05, T06, T07) scan **5 times**.

A branch passes consistency if:
- Verdict status is identical across all runs
- Severity score is identical across all runs
- Layers fired are identical across all runs

Any variance is logged as a **consistency failure** in the run report.

---

## Report Naming Convention

```
{track}-{id}-{branch-slug}-run{n}-{YYYYMMDD}.json
```

Examples:
```
t01-safe-small-additive-run1-20260423.json
a06-threshold-gaming-run1-20260423.json
```

---

## Summary Table

| ID | Branch | Track | Expected Verdict | Layers |
|---|---|---|---|---|
| T01 | `safe/small-additive` | Validation | SAFE | None |
| T02 | `safe/docs-only` | Validation | SAFE | None |
| T03 | `destructive/mass-deletion` | Validation | DESTRUCTIVE | L1 L2 L3 L4 |
| T04 | `destructive/april-2026-replica` | Validation | DESTRUCTIVE | L1 L2 L3 L4 L5a L5b |
| T05 | `boundary/structural-threshold` | Validation | CAUTION/REVIEW | L4 |
| T06 | `boundary/temporal-warning` | Validation | REVIEW | L5a |
| T07 | `boundary/temporal-critical` | Validation | CAUTION | L5a |
| T08 | `mixed/stale-branch-tiny-change` | Validation | REVIEW | L5a |
| T09 | `semantic/no-description` | Validation | DESTRUCTIVE | L1 L2 L3 L4 L5b(UNVERIFIED) |
| T10 | `semantic/honest-critical` | Validation | DESTRUCTIVE | L1 L2 L3 L4 |
| T11 | `multilang/structural-js-ts-go` | Validation | CAUTION/DESTRUCTIVE | L4 |
| A01 | `adversarial/keyword-evasion` | Adversarial | DESTRUCTIVE | L1 L2 L3 L4 |
| A02 | `adversarial/rename-smuggling` | Adversarial | REVIEW/CAUTION | L1 |
| A03 | `adversarial/slow-deletion` | Adversarial | SAFE/REVIEW | None/L4 |
| A04 | `adversarial/addition-camouflage` | Adversarial | CAUTION/DESTRUCTIVE | L1 L2 L3 |
| A05 | `adversarial/nested-gutting` | Adversarial | CAUTION/DESTRUCTIVE | L4 |
| A06 | `adversarial/threshold-gaming` | Adversarial | SAFE | None |
| A07 | `adversarial/new-file-replacement` | Adversarial | CAUTION/DESTRUCTIVE | L1 L2 L3 |
| A08 | `adversarial/empty-diff` | Adversarial | SAFE | None |
| A09 | `adversarial/config-only-deletion` | Adversarial | REVIEW/CAUTION | L2 |
| A10 | `adversarial/unicode-payload` | Adversarial | SAFE/graceful error | None |

---

*PayloadGuard Test Harness v1.0 — 21 branches, 2 tracks*  
*Built to find the limits before production does.*
