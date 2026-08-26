# TaskMan Pro — Android Application Engineering Blueprint

## 1. Executive Summary

A native Android application for TaskMan Pro, written in Kotlin with Jetpack
Compose and Room. It ports the existing Flask/Web task manager to a
standalone, offline-first mobile app. Task data lives entirely on-device in a
Room (SQLite) database; there is no server dependency. The priority model —
`Priority = Urgency + Importance + Risk` — and the recurrence semantics are
ported faithfully from `app.py`.

The deliverable is a publish-ready build: a signed release AAB, correct
manifest/signing configuration, adaptive app icon, and a privacy policy with
Play Store data-safety declarations. The Android app is added to the existing
`taskmanpro` repository in an `android/` subdirectory without removing or
modifying the existing Flask version.

## 2. Purpose

Provide the same task-management capability as the web app in a native mobile
form factor that works without network access. Existing users of the web app
get a phone-native equivalent; the app is a port, not a re-design.

## 3. Scope

### In Scope
- Create, view, edit, complete, and delete tasks.
- One-off and recurrent tasks (recurrence interval in days).
- Priority scoring: `urgency + importance + risk`, with urgency derived from
  due date (overdue=5, today=4, tomorrow=3, ≤3 days=2, else=1).
- Task list sorted by `(-priority, due_date, id)`.
- Recurrent auto-copy: a recurrent task due within 7 days is materialised as a
  one-off task (the same behaviour as the web app).
- Completion semantics: completing a one-off marks it complete; completing a
  recurrent task records a completion, creates a completed one-off copy, and
  advances the original's due date by the interval.
- Duplicate-completion guard per `(task_id, scheduled_due_date)`.
- Completed-tasks history screen.
- Validation parity with the web app (title required ≤100 chars; due date
  required; importance/risk in 1..5; recurrence interval ≥1 for recurrent).
- Publish-ready release build: signed AAB, adaptive icon, privacy policy.

### Out of Scope
- Cross-device sync or any network backend.
- User accounts, authentication, or multi-user support.
- Notifications/reminders (future consideration only).
- iOS/Flutter (out of scope for this version).
- Import/export of the existing Flask `tasks.db`.

### Future Considerations
- Push/notification reminders.
- Optional sync with a hosted backend.
- Data export/backup.

## 4. Users and Roles

Single local user. No roles, no authentication. All data is device-local.

## 5. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR1 | User can create a task with title, description, due date, importance (1-5), risk (1-5), and a recurrent flag with recurrence interval in days. |
| FR2 | Validation rejects: missing/empty title, title > 100 chars, missing/invalid due date, importance/risk outside 1..5, recurrent with interval < 1. |
| FR3 | Task list shows all active tasks sorted by priority descending, then due date ascending, then id ascending. |
| FR4 | Priority is computed as `urgency + importance + risk`. |
| FR5 | Urgency is 5 (overdue), 4 (today), 3 (tomorrow), 2 (≤3 days), 1 (otherwise). |
| FR6 | A recurrent task whose due date is within 7 days is auto-materialised as a one-off task (deduplicated by title+due date). |
| FR7 | Completing a one-off task marks it completed and records a completion. |
| FR8 | Completing a recurrent task records a completion, creates a completed one-off copy, and advances the original due date by the interval. |
| FR9 | Completing a task twice for the same scheduled due date is a no-op (duplicate guard). |
| FR10 | User can view task detail including priority breakdown (urgency/importance/risk) and edit notes. |
| FR11 | User can edit all task fields. |
| FR12 | User can delete a task (and its completion history). |
| FR13 | Completed-tasks history is viewable, ordered by completed time descending. |

## 6. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR1 | Fully offline: all operations complete without network access. |
| NFR2 | Data is persisted in Room (SQLite); survives process death. |
| NFR3 | Deterministic sorting matches the web app exactly. |
| NFR4 | Release build is a signed AAB suitable for Play Store upload. |
| NFR5 | `targetSdk` meets current Play Store requirement (35); `minSdk` 26. |
| NFR6 | App ships with an adaptive launcher icon and a privacy policy. |
| NFR7 | No secrets in source; keystore and credentials are git-ignored and stored outside the repo. |

## 7. Architecture

Single-module Android app, MVVM architecture.

Components:
- **UI layer** — Jetpack Compose screens (`TaskListScreen`, `TaskEditScreen`,
  `TaskDetailScreen`, `CompletedScreen`).
- **ViewModel** — `TaskViewModel` (or per-screen ViewModels) exposing
  `StateFlow` of UI state and dispatching intents.
- **Repository** — `TaskRepository`, the single entry point to data; owns the
  recurrence and completion business rules.
- **Data layer** — Room database with `TaskEntity` and `CompletionEntity`,
  DAOs, and type converters for `LocalDate`.

Data flow: Compose → ViewModel → Repository → DAO → Room. Business rules
(priority, urgency, recurrence materialisation, completion semantics) live in
the Repository/domain layer so they are unit-testable without Android.

Architectural decisions:
- **Room over raw SQLite**: type-safe, lifecycle-aware, standard. Consequence:
  a small KSP dependency.
- **Compose over XML views**: modern, matches "native Kotlin" requirement.
- **Business logic in pure Kotlin**: deterministic and unit-testable on the
  JVM without an emulator.
- **No DI framework**: manual wiring keeps the dependency set small.

## 8. Components

- `MainActivity` — hosts the Compose UI and navigation.
- `TaskApp` — top-level composable with navigation.
- `TaskViewModel` — exposes list/active/completed state and mutations.
- `TaskRepository` — business rules + data access.
- `AppDatabase` — Room database.
- `TaskDao`, `CompletionDao` — queries and mutations.
- `TaskEntity`, `CompletionEntity` — data model.

## 9. Data Model

### TaskEntity (table `tasks`)
| Field | Type | Constraints |
|-------|------|-------------|
| id | Long | PK, auto-generate |
| title | String | required, ≤100 |
| description | String? | nullable |
| isRecurrent | Boolean | default false |
| dueDate | LocalDate | required |
| recurrenceInterval | Int | default 0; ≥1 when recurrent |
| importance | Int | 1..5 |
| risk | Int | 1..5 |
| isCompleted | Boolean | default false |
| createdAt | Instant | default now |
| updatedAt | Instant | default now, on-update |

### CompletionEntity (table `completions`)
| Field | Type | Constraints |
|-------|------|-------------|
| id | Long | PK, auto-generate |
| taskId | Long | FK → tasks.id, cascade delete |
| scheduledDueDate | LocalDate | required |
| completedAt | Instant | required |

Uniqueness guard on `(taskId, scheduledDueDate)` for duplicate completion.

## 10. Interfaces

Internal only (no network API). Repository exposes:
- `observeActiveTasks(): Flow<List<TaskWithPriority>>`
- `observeCompletions(): Flow<List<CompletionEntity>>`
- `createTask(...)`, `updateTask(...)`, `completeTask(id)`, `deleteTask(id)`.

Contracts mirror the web app's routes (`add_task`, `edit_task`,
`complete_task`, `delete_task`, `completed_tasks`) 1:1 in behaviour.

## 11. Security

- No network, no accounts, no secrets. Data stays on-device.
- Keystore (signing) and its credentials are stored outside the repository and
  listed in `.gitignore`.
- No logging of task content.
- Play Store data-safety declarations state that no data is collected or
  shared; all data remains on-device.

## 12. Failure Behaviour

- **Invalid input**: rejected by validation; UI shows field errors (parity
  with web validation messages).
- **DB failure on write**: surfaced as an error state in the ViewModel; no
  silent corruption.
- **Duplicate completion**: guarded, becomes a no-op.
- **Missing due date on completion of non-recurrent**: treated as already
  handled (no completion recorded), matching web behaviour.

## 13. Testing Strategy

- **Unit tests (JVM)**: business logic — priority/urgency calculation,
  validation, recurrence materialisation, completion semantics, duplicate
  guard, sorting. Room tested with in-memory database or Robolectric where
  DAO coverage is needed.
- **Build verification**: `./gradlew assembleRelease` and `bundleRelease`
  must succeed; AAB must be signed.
- No device/emulator tests are required for this version, but `assembleDebug`
  must compile to prove the UI layer builds.

## 14. Acceptance Criteria

- `./gradlew test` passes all unit tests covering FR1–FR13 business rules.
- `./gradlew bundleRelease` produces a signed `.aab` with a valid keystore.
- `targetSdk = 35`, `minSdk = 26`.
- App has an adaptive icon and a privacy policy document.
- The existing Flask app remains unchanged and functional.
- Android sources are committed to `android/` in the `taskmanpro` repo with
  the signing keystore and credentials excluded.

## 15. Deployment and Operations

- Build: `./gradlew bundleRelease` (AAB) for Play Store; `assembleDebug` for
  local install.
- Signing keystore generated with `keytool`; path via `keystore.properties`
  (git-ignored).
- No runtime configuration; the app has no environment dependencies.

## 16. Dependencies

| Dependency | Purpose | Version |
|-----------|---------|---------|
| Kotlin | language | 2.0.x |
| AGP | build | 8.x |
| Compose BOM | UI | current stable |
| Room (runtime + KSP compiler) | persistence | 2.6.x |
| Lifecycle ViewModel Compose | MVVM | current |
| Navigation Compose | navigation | current |
| kotlinx-coroutines | async | current |
| JUnit | unit tests | 4.13.x |

## 17. Assumptions

- A single local user; no sync (confirmed by user).
- Native Kotlin + Compose (confirmed by user).
- Publish-ready build means a signed AAB + compliance artifacts; the user
  performs the actual Play Console upload (confirmed by user).
- JDK 21 and the Android SDK are installable on the build machine (verified).

## 18. Open Questions

None material. The three architectural forks (platform, data, publish scope)
were resolved with the user.

## 19. Architectural Decisions

1. Native Kotlin + Compose (not WebView, not Flutter) — user decision.
2. Standalone Room storage (no backend) — user decision.
3. Business rules in pure Kotlin for JVM unit testing — engineering decision
   for testability.
4. `minSdk 26` / `targetSdk 35` — covers current Play Store requirement while
   reaching ~97% of devices.

## 20. Implementation Boundaries

- New code is confined to `android/`.
- No modification to the Flask app, its templates, or its tests.
- No removal of existing files.
