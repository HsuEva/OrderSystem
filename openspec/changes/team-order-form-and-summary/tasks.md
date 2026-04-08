## 1. Colleague roster and data model foundation

- [x] 1.1 Define data entities for colleague roster, order session, menu items, drink options, and colleague submission
- [x] 1.2 Implement persistence schema/migrations for colleague roster and session-scoped settings
- [x] 1.3 Add API contracts for creating session, assigning roster, and retrieving session configuration

## 2. Global colleague roster management

- [x] 2.1 Implement organizer flow to maintain global colleague roster (add, modify, delete colleagues)
- [x] 2.2 Implement roster UI and impact warnings for edits
- [x] 2.3 Add safeguards to alert organizer when modifying colleagues with active submissions

## 3. Dynamic menu management

- [x] 3.1 Implement organizer flow to create food and drink items per session
- [x] 3.2 Implement organizer flow to configure sweetness and ice option sets per session
- [x] 3.3 Implement organizer flow to assign colleague roster to session with optional deadline
- [x] 3.4 Add guardrails for destructive menu edits with impact warning and explicit confirmation

## 4. Shared form collection with roster-based colleague selection

- [x] 4.1 Implement shareable session form endpoint with roster dropdown (no free text colleague entry)
- [x] 4.2 Implement submission validation for required fields and roster membership enforcement
- [x] 4.3 Implement deterministic duplicate handling: latest submission replaces previous one for same roster-bound colleague
- [x] 4.4 Implement deadline enforcement so submissions are rejected after session close time

## 5. Statistics and aggregation

- [x] 5.1 Implement food summary aggregation by item and quantity
- [x] 5.2 Implement drink summary aggregation by drink item + sweetness + ice level tuple
- [x] 5.3 Ensure summary computation uses latest valid submission per colleague
- [x] 5.4 Implement CSV export for latest valid order details and aggregated statistics

## 6. Verification and release readiness

- [x] 6.1 Add tests for roster management, menu setup, roster-based validation, deadline enforcement, duplicate replacement, and summary correctness
- [x] 6.2 Add end-to-end check for multi-colleague ordering flow from roster setup through session setup to summary output
- [x] 6.3 Verify CSV export content/encoding and validate rollback path; document known limitations/open questions for MVP handoff