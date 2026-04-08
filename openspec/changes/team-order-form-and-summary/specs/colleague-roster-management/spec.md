## ADDED Requirements

### Requirement: System maintains global colleague roster
The system MUST maintain a global colleague roster where organizers can add, modify, or delete colleague entries.

#### Scenario: Create colleague entry
- **WHEN** an organizer adds a new colleague with name
- **THEN** the system stores the colleague in the global roster

#### Scenario: Modify colleague entry
- **WHEN** an organizer updates a colleague's name or employee identifier
- **THEN** the system applies the change and flags any affected ongoing sessions

#### Scenario: Delete colleague entry
- **WHEN** an organizer deletes a colleague from the roster
- **THEN** the system removes the entry; if the colleague has existing submissions, the organizer receives a warning about impact

### Requirement: Organizer can select colleague roster for a session
The system MUST allow the organizer to choose which colleagues from the global roster are eligible for each order session form.

#### Scenario: Assign roster to session
- **WHEN** the organizer creates a session and selects colleagues from the global roster
- **THEN** the form populates the colleague selection dropdown with only those colleagues

### Requirement: Form colleague selection must enforce roster membership
The system MUST validate that submitted colleague identifiers exist in the session's assigned roster.

#### Scenario: Submit order with valid roster member
- **WHEN** a colleague selects their name from the session's roster dropdown and submits
- **THEN** the system records the submission under that colleague's roster entry

#### Scenario: Attempt submission with non-roster colleague
- **WHEN** a submission attempts to use a colleague identifier not in the session's roster
- **THEN** the system rejects the submission as invalid colleague