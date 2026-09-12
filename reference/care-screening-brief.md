# Care Screening plugin brief

This brief turns issue #25 into an implementation-ready scope for a separate
`care_screening` backend plugin and `care_screening_fe` frontend plugin.

## Product scope

`care_screening` manages public-health screening programmes from campaign
planning through follow-up. Programme teams can schedule screening camps,
define the target population, record screening episodes and outcomes, and
manage recalls for people who need follow-up.

The first release is a staff-facing workflow for programme administrators,
facility staff, nurses, and public-health managers. It does not add a patient
portal flow or an external messaging dependency; SMS and other reminders can
be added later behind a plugin integration.

## Domain model

The plugin owns its domain data and migrations:

- **Campaign** — programme name, screening type, target criteria, facilities or
  camps, schedule, lifecycle state, and responsible users.
- **Screening episode** — the person screened, campaign, camp/facility,
  screening date, measurements/results, disposition, and recording staff.
- **Recall** — a follow-up requirement linked to an episode, due date, status,
  outcome, and assigned staff member.

Use foreign keys from plugin models into CARE records where an existing
patient, facility, or user identity is needed. Do not add reverse foreign keys,
screening-specific columns, or plugin imports to core. Use a namespaced
`meta["screening"]` annotation only for lightweight flags on an existing core
record.

## Lifecycle and permissions

Campaign states are:

| State | Meaning | Allowed actors |
| --- | --- | --- |
| `draft` | Being prepared and not yet accepting screenings | Programme admin |
| `active` | Screening is available and episodes may be recorded | Programme admin |
| `paused` | Temporarily stopped for operational reasons | Programme admin |
| `closed` | Finished and retained for reporting | Programme admin |

Facility staff and nurses can record screening episodes and update recall
outcomes. Public-health managers can view campaign coverage, recall status,
and overdue work. Programme admins can create, edit, activate, pause, and
close campaigns. Enforce these capabilities in plugin viewsets using the
authenticated CARE role context; do not modify core permission tables.

## API surface

The backend is mounted by CARE at `/api/care_screening/`:

- `campaigns/` — list, create, retrieve, update, and lifecycle actions.
- `episodes/` — list and record screening episodes, scoped by campaign,
  facility, and the caller's permissions.
- `recalls/` — list, assign, update, complete, and mark overdue follow-ups.
- `metrics/` — campaign-level coverage and recall summaries.
- `config/` — client-safe feature configuration.

Every queryset must exclude soft-deleted records and apply authorization
before optional campaign, facility, or status filters. Invalid lifecycle
transitions should return DRF validation errors rather than silently changing
state.

## Frontend surface

`care_screening_fe` should expose a federated manifest with a dedicated
`/screening` route and scoped UI under `.care-screening-container`:

- campaign list and status filters;
- campaign detail with coverage and recall metrics;
- screening episode entry and history;
- recall queue with due and overdue filters;
- lifecycle actions gated by the current user's capability.

Translations belong in the plugin's own locale files under the
`screening__` namespace. The frontend must use the CARE API URL and auth
context supplied by the host rather than embedding credentials or service
URLs.

## Core integration boundary

Start with zero core code changes. Register the backend through
`care/plug_config.py`, enable the remote through the host's plugin
configuration, and use existing routes and extension points. Only add a
generic core extension point if an existing route or supported plugin
component cannot host the screening entry point; the extension point must not
mention screening or this plugin by name.

## Acceptance criteria

- A fresh scaffold contains no unsubstituted template tokens.
- Backend models, migrations, serializers, viewsets, and URLs are confined to
  `care_screening`.
- Campaign lifecycle transitions enforce the states and roles above.
- Screening and recall querysets are authorization-scoped and exclude soft
  deletes.
- Frontend manifest, route, API client, locale namespace, and Tailwind scope
  are confined to `care_screening_fe`.
- The plugin can be registered and enabled without plugin-specific changes to
  CARE core.
- Focused backend tests cover lifecycle permissions, invalid transitions,
  queryset scoping, episode creation, and recall completion.
