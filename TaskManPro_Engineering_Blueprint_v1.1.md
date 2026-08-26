# TaskManPro Engineering Improvement Blueprint

**Version:** 1.1  
**Date:** 26 August 2026  
**Source baseline:** `taskmanpro-main.zip`, commit `8d70d26e93cbdebdb8f3e0d8293aba221e4130ee`

---

## 1. Engineering Directive

Improve TaskManPro **without turning it into a project-management platform**.

The product advantage is its small mental model:

> The user states the task, due date, importance, and risk. TaskManPro derives urgency and ranks the workload.

The upgrade must strengthen:

- correctness
- data integrity
- security
- speed of use
- explainability

while preserving that mental model.

### Primary product invariant

> **No new user-facing concept may be introduced unless an observed failure cannot be solved within the existing Task + Due Date + Importance + Risk model.**

Do not add complexity merely to match features found in ClickUp, Asana, Notion, Todoist, or other products.

---

# 2. Non-Negotiable Product Invariants

1. Priority remains deterministic and transparent:

   `Priority = Urgency + Importance + Risk`

2. Urgency remains automatic. The user never manually manages urgency.

3. Importance and Risk remain explicit human judgements on a 1–5 scale.

4. The default task list remains a ranked list, not a dashboard, kanban board, workflow engine, or project hierarchy.

5. Do **not** introduce the following in v1.1:
   - projects
   - folders
   - tags
   - labels
   - dependencies
   - assignees
   - sprints
   - custom statuses
   - custom fields
   - AI classification
   - workflow state machines

6. One-off and recurrent tasks remain the only task types.

7. Completing a recurrent task advances its next due date. It does not create a growing collection of future task rows.

8. Every proposed feature must remove friction, correct a defect, or expose information the system already knows.

---

# 3. Current System Baseline

| Area | Current implementation | Assessment |
|---|---|---|
| Runtime | Flask + Flask-SQLAlchemy + SQLite | Appropriate for a small local application |
| Task model | Title, description, recurrent flag, start_date, recurrence interval, importance, risk, completed flag | Small and understandable; preserve |
| Priority | Urgency + Importance + Risk | Core differentiator; preserve |
| Urgency | 5 overdue; 4 today; 3 tomorrow; 2 within 3 days; 1 later | Simple and explainable; do not change without evidence |
| Ordering | Priority descending, then due date ascending | Correct deterministic tie-breaker |
| Recurrence | Stored due date advances by interval on completion | Good minimal recurrence model |
| History | Completion row per completion | Useful, but current date semantics need correction |
| UI | Bootstrap tables and forms | Functional; simplify interaction rather than add screens |

---

# 4. Defects and Engineering Risks

These should be fixed **before feature work**.

| ID | Severity | Finding | Required correction |
|---|---|---|---|
| D-01 | High | `Completion.completion_date` is populated with the task due date, not the actual completion date/time | Store scheduled due date separately from actual completion timestamp |
| D-02 | High | State-changing operations use GET routes: complete, delete task, delete completion, shutdown | Convert mutations to POST and protect them with CSRF |
| D-03 | High | Custom `nl2br` filter wraps user text in `Markup` without first escaping it | Escape user content before adding `<br>` or use CSS `white-space: pre-wrap` |
| D-04 | High | `app.run(debug=True)` is hard-coded | Debug must be disabled by default and controlled by development configuration |
| D-05 | Medium | Internal field is called `start_date` even though the application treats it as a due date | Rename/migrate to `due_date` |
| D-06 | Medium | Edit Task cannot change importance, risk, or recurrence settings | Edit must expose the same task-defining inputs as Create |
| D-07 | Medium | POST data relies heavily on browser-side constraints | Add server-side validation for all inputs |
| D-08 | Medium | `/shutdown` calls `os._exit(0)` from a web route | Remove from normal web operation; process lifecycle belongs to the launcher/service |
| D-09 | Low | Completed history is unsorted | Order by actual completion timestamp descending |
| D-10 | Low | README and UI mix Start Date and Due Date terminology | Use Due Date consistently |

---

# 5. Target v1.1 Data Model

Keep the model deliberately small.

Only correct semantic problems or add information required for correct behaviour.

## Task

```text
id                  INTEGER PRIMARY KEY
title               VARCHAR(100) NOT NULL
description         TEXT NULL
is_recurrent        BOOLEAN NOT NULL DEFAULT FALSE
due_date            DATE NOT NULL
recurrence_interval INTEGER NOT NULL DEFAULT 0
importance          INTEGER NOT NULL CHECK 1..5
risk                INTEGER NOT NULL CHECK 1..5
is_completed        BOOLEAN NOT NULL DEFAULT FALSE
created_at          DATETIME NOT NULL
updated_at          DATETIME NOT NULL
```

## Completion

```text
id                 INTEGER PRIMARY KEY
task_id            INTEGER NOT NULL FK task.id
scheduled_due_date DATE NOT NULL
completed_at       DATETIME NOT NULL
```

### Important semantic rule

`scheduled_due_date` records **which occurrence was satisfied**.

`completed_at` records **when the user actually completed it**.

Do not fabricate historical completion timestamps during migration.

---

# 6. Priority Engine Contract

The priority engine must be a **pure deterministic function**.

It must not:

- query the database
- depend on UI state
- depend on session state
- mutate data

## Urgency

```text
urgency(due_date, today):

    due_date < today        -> 5
    due_date == today       -> 4
    due_date <= today + 1d  -> 3
    due_date <= today + 3d  -> 2
    otherwise               -> 1
```

## Priority

```text
priority = urgency + importance + risk
```

Range:

```text
minimum = 3
maximum = 15
```

## Ordering

```text
sort key = (-priority, due_date, task_id)
```

`task_id` is the final tie-breaker so ordering remains fully deterministic even where both priority and due date are identical.

### Do not introduce weighting in v1.1

Do **not** replace the formula with:

```text
w1 * urgency + w2 * importance + w3 * risk
```

unless real-world evidence later demonstrates that the current model fails.

The current formula is valuable because it is:

- simple
- deterministic
- explainable
- easy to test
- easy for users to understand

---

# 7. User Interface Blueprint

The goal is:

> **Fewer decisions and less reading.**

Not more functionality.

## 7.1 Task List Is the Operational Home

After launch, `/tasks` should be the primary operational screen.

Keep navigation minimal.

### Task list

Retain the existing conceptual grouping:

- One-Off Tasks
- Recurrent Tasks

Do **not** introduce categories such as:

- Act Now
- Waiting
- Blocked
- On Track
- Someday
- Pipeline

The priority score already provides the ranking mechanism.

### Visible task information

Show:

- Task
- Due
- Priority
- Complete
- Edit
- Delete

Notes should remain accessible without creating additional workflow concepts.

### Priority explanation

Optionally allow a small tooltip, disclosure, or click explanation such as:

> `Urgency 4 + Importance 5 + Risk 3 = Priority 12`

This uses existing data and improves trust without creating a new model.

### Visual hierarchy

Use restrained visual treatment for:

- overdue tasks
- high priority

Do not create multiple competing colour systems.

---

# 8. Add/Edit Task

Create and Edit should expose the same task-defining fields.

| Field | Control | Rule |
|---|---|---|
| Task | Single-line text | Required; max 100 characters |
| Notes | Textarea | Optional |
| Due Date | Date | Required |
| Recurrent | Checkbox | Off by default |
| Repeat every | Positive integer days | Visible/enabled only when recurrent |
| Importance | 1–5 selector/radio | Required |
| Risk | 1–5 selector/radio | Required |

### Do not add

- effort estimate
- category
- owner
- project
- status
- tag
- dependency
- workflow state

The form should remain completable in seconds.

### Importance and Risk explanations

Retain plain-language anchors.

#### Importance

```text
1 - Minimal impact on goals
2 - Some impact, not critical
3 - Important for medium-term goals
4 - Very important for long-term goals
5 - Critical for success
```

#### Risk

```text
Use the existing application's risk scale wording.
Keep it explicit and understandable.
```

---

# 9. Completion Semantics

Completion must be precise because recurrence depends on it.

## One-off task

When user completes a one-off task:

1. Read current `due_date`.
2. Insert completion row:

```text
task_id = current task
scheduled_due_date = current due_date
completed_at = current timestamp
```

3. Set:

```text
is_completed = true
```

4. Commit in the same database transaction.

## Recurrent task

When user completes a recurrent task:

1. Read current `due_date`.
2. Insert completion row with:
   - task ID
   - scheduled due date
   - actual completion timestamp
3. Calculate:

```text
next_due_date = current_due_date + recurrence_interval
```

4. Update the existing task's due date.
5. Keep the task active.
6. Commit completion + task update in one transaction.

### Important recurrence rule

Preserve the current anchored behaviour.

If:

```text
Due date: 1st
Repeat: every 30 days
Completed: 5th
```

the next due date must be calculated from the **scheduled occurrence**, not from the actual completion date.

Do not silently change this semantics.

---

# 10. Validation Contract

All validation must occur server-side.

Browser validation is supplemental only.

| Input | Validation |
|---|---|
| `title` | Trim whitespace; required; 1–100 chars |
| `description` | Optional; render safely |
| `due_date` | Valid ISO date; required |
| `importance` | Integer 1–5 |
| `risk` | Integer 1–5 |
| `is_recurrent` | Boolean |
| `recurrence_interval` | `0` for one-off; `>=1` for recurrent |

Invalid data must:

- be rejected
- return the form
- preserve the submitted values
- show concise field-level errors

Never silently coerce invalid input into something else.

---

# 11. HTTP Route Contract

All persistent state changes must use POST.

| Method | Route | Purpose |
|---|---|---|
| GET | `/tasks` | Read ranked active tasks |
| GET/POST | `/tasks/new` | Create task |
| GET/POST | `/tasks/<id>/edit` | Edit task |
| POST | `/tasks/<id>/complete` | Complete current occurrence |
| POST | `/tasks/<id>/delete` | Delete task |
| GET | `/completed` | Read completion history |
| POST | `/completed/<id>/delete` | Delete completion record, if retained |
| — | No `/shutdown` web route | Process lifecycle handled outside HTTP |

No route reached via GET may mutate persistent state.

---

# 12. Security and Operational Hardening

Implement the following before release:

1. Add CSRF protection using Flask-WTF or an equivalent mechanism.
2. Ensure user-entered notes are HTML-escaped before rendering.
3. Disable Flask debug mode by default.
4. Make debug mode available only through explicit development configuration.
5. Bind to `127.0.0.1` by default for local use.
6. Remove browser-accessible shutdown.
7. Pin runtime dependencies in `requirements.txt`.
8. Load `SECRET_KEY` from the environment for session/CSRF support.
9. Never commit development or production secrets.
10. Keep SQLite databases and runtime logs out of Git.

---

# 13. Code Structure

The current single-file application is small enough to remain understandable.

Do **not** introduce a large enterprise-style architecture.

Preferred structure:

```text
taskmanpro/
  app.py
  priority.py
  models.py          # optional
  templates/
  static/
  tests/
    test_priority.py
    test_tasks.py
    test_recurrence.py
  requirements.txt
```

### Guidance

At minimum:

- extract the priority functions into `priority.py`
- add automated tests

`models.py` is optional.

Do not introduce layers such as:

```text
repositories/
services/
controllers/
DTOs/
domain/
use_cases/
adapters/
```

unless the application becomes large enough to justify them.

---

# 14. Mandatory Automated Tests

## Priority

Test all urgency boundaries:

```text
Overdue       = 5
Today         = 4
Tomorrow      = 3
+2 days       = 2
+3 days       = 2
+4 days       = 1
```

Test:

```text
minimum priority = 3
maximum priority = 15
```

## Sorting

Verify:

1. Higher priority first.
2. Equal priority: earlier due date first.
3. Exact tie: lower task ID first.

## One-off completion

Verify:

- completion row created
- scheduled due date recorded
- actual completion timestamp recorded
- task no longer appears in active list

## Recurring completion

Verify:

- completion row created
- scheduled due date recorded
- actual completion timestamp recorded
- next due date advances exactly one recurrence interval
- task remains active

## Late recurring completion

Example:

```text
Scheduled due: 1 Aug
Completed:     5 Aug
Interval:      30 days
```

Expected next due date:

```text
31 Aug
```

Not:

```text
4 Sep
```

## Validation

Verify invalid values are rejected:

- importance = 0
- importance = 6
- risk = 0
- risk = 6
- negative recurrence interval
- zero recurrence interval when recurrent
- non-integer recurrence interval
- blank title
- invalid date

## Security

Verify:

- GET cannot complete a task
- GET cannot delete a task
- POST without valid CSRF token is rejected
- user-entered HTML/JavaScript is not executed

---

# 15. Database Migration Plan

Do not destroy or recreate the existing database.

Create a backup first:

```text
instance/tasks.db.bak-YYYYMMDD-HHMMSS
```

## Migration steps

1. Back up the database.
2. Rename `Task.start_date` to `due_date`.
3. Preserve all task rows.
4. Add `scheduled_due_date` to Completion.
5. Copy existing legacy completion date information into `scheduled_due_date`.
6. Add `completed_at`.
7. Do **not** fabricate historical completion timestamps.
8. If actual completion time is unavailable, represent that honestly as legacy/unknown according to the chosen schema.
9. Ensure all new completions populate both:
   - `scheduled_due_date`
   - `completed_at`
10. Verify:
    - task count unchanged
    - completion count unchanged
    - recurring due dates unchanged
    - priority calculation unchanged

If a migration framework is not already required, use a small explicit migration script rather than introducing a large framework solely for this change.

---

# 16. Implementation Sequence

## Phase 1 — Characterisation

Before changing behaviour:

- write tests around current priority calculation
- write tests around current sorting
- write tests around recurrence

### Exit gate

The tests accurately reproduce the intended current behaviour.

---

## Phase 2 — Correctness

Implement:

- completion semantics
- `due_date` naming
- edit-field parity
- server-side validation
- deterministic tie-breaking

### Exit gate

All functional tests pass.

---

## Phase 3 — Security

Implement:

- POST-only mutations
- CSRF protection
- safe HTML rendering
- debug configuration
- removal of browser shutdown

### Exit gate

Security tests pass.

---

## Phase 4 — Friction Reduction

Implement only small improvements:

- `/tasks` as operational home
- streamline visible columns
- conditional recurrence input
- optional priority explanation
- consistent Due Date terminology

### Exit gate

No new user-facing organisational concept has been introduced.

---

## Phase 5 — Documentation

Update:

- README
- installation instructions
- database semantics
- recurrence semantics
- priority formula
- development configuration
- security notes

### Exit gate

Documentation exactly matches the implementation.

---

## Phase 6 — Release

1. Back up production/user database.
2. Run migration.
3. Run automated test suite.
4. Perform UI smoke test.
5. Verify historical records.
6. Verify priority ordering.
7. Verify recurrence.
8. Verify create/edit/complete/delete.

### Exit gate

Existing user data remains intact and the application is operational.

---

# 17. Explicit v1.1 Non-Goals

Do **not** add:

- AI task parsing
- natural-language task creation
- projects
- folders
- tags
- labels
- kanban boards
- calendar suite
- Gantt charts
- dependencies
- team collaboration
- assignees
- behavioural analytics
- productivity scores
- custom priority weights
- notification subsystem
- cloud sync
- account system
- effort estimates
- dashboard redesigns
- visual redesigns whose main purpose is novelty

These may be considered later only if a specific real-world problem demonstrates a need.

---

# 18. Product Acceptance Criteria

The release is acceptable only when all of the following are true:

- A new user can understand the task model without documentation.
- The core model remains:
  - Task
  - Due Date
  - Importance
  - Risk
- Creating a one-off task requires no unnecessary organisational decisions.
- The priority formula remains deterministic.
- The ranking is reproducible.
- Every displayed priority can be explained from:
  - Urgency
  - Importance
  - Risk
- No GET request changes persistent state.
- User-entered notes cannot execute HTML or JavaScript.
- Completion history records the actual completion timestamp for new completions.
- Recurring tasks advance exactly one configured interval.
- Existing database contents survive migration.
- The default operational screen remains the ranked task list.
- No v1.1 feature requires users to maintain another organisational taxonomy.

---

# 19. Feature Decision Rule for Future Development

Every future feature proposal must pass all three gates.

## Gate 1 — Necessity

**Question:**

> What observed user failure does this solve?

Pass only if there is a concrete failure.

Do not build a feature merely because another task application has it.

---

## Gate 2 — Simplicity

**Question:**

> Does the user have to maintain a new concept?

Prefer **no**.

If yes, the benefit must clearly exceed the ongoing cognitive cost.

---

## Gate 3 — Determinism

**Question:**

> Can the user understand what the system will do?

Pass only if behaviour is:

- predictable
- inspectable
- reversible where appropriate

---

# 20. Final Engineering Directive

> **Do not expand TaskManPro into a general project-management system.**

The objective is to make the existing idea:

- more correct
- safer
- easier to use
- easier to trust

Preserve:

```text
Urgency + Importance + Risk
```

as the transparent priority model.

Fix semantic defects and security issues first.

Reduce clicks and ambiguity second.

Only add another task attribute or workflow concept if real usage demonstrates a specific failure that cannot be solved within the existing model.

## Success definition

The release is successful when:

> **TaskManPro becomes easier to trust and easier to use while requiring the user to understand no more concepts than before.**
