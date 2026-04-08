## ADDED Requirements

### Requirement: Colleagues can submit orders through a shared session form
The system MUST provide a shareable order form for each session so colleagues can select their identity from the assigned roster and submit their food and drink selections.

#### Scenario: Submit an order through a shared form link
- **WHEN** a colleague opens the session form, selects their name from the roster dropdown, and submits order fields
- **THEN** the system records the colleague's order under that session using the roster-bound identity

### Requirement: Form colleague selection must be roster-bound
The system MUST populate the colleague selection field with only colleagues in the session's assigned roster (no free text entry).

#### Scenario: Form displays roster members
- **WHEN** a colleague opens the session form
- **THEN** the colleague selection dropdown shows only members of the session's assigned colleague roster

### Requirement: Submission must validate required fields and roster membership
The system MUST validate required fields and ensure the submitted colleague identifier belongs to the session's roster.

#### Scenario: Missing required field or invalid roster selection
- **WHEN** a colleague submits an order missing required fields or selects a colleague not in the session's roster
- **THEN** the system rejects the submission and shows validation errors

### Requirement: Form submission must enforce session deadline
The system MUST reject new or updated submissions after the configured submission deadline for the session.

#### Scenario: Submit after session deadline
- **WHEN** a colleague submits or updates an order after the session deadline has passed
- **THEN** the system rejects the submission as session closed

### Requirement: Duplicate submissions from the same colleague must be handled deterministically
The system MUST apply a deterministic rule for repeat submissions from the same colleague within the same session.

#### Scenario: Same colleague submits again in the same session
- **WHEN** an order is submitted using an identifier that already exists in that session
- **THEN** the system replaces the previous submission with the latest submission and records the update timestamp