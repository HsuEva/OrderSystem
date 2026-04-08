## ADDED Requirements

### Requirement: Organizer can configure per-session menu
The system MUST allow an organizer to create an order session and define the menu for that session, including food items and drink items.

#### Scenario: Create a new order session with menu items
- **WHEN** the organizer creates a session and enters at least one food item or drink item
- **THEN** the system stores the session and menu items for that specific session

### Requirement: Organizer can configure drink option sets
The system MUST allow the organizer to define available sweetness levels and ice levels for drink customization in each order session.

#### Scenario: Define drink option sets for a session
- **WHEN** the organizer saves sweetness options and ice options for the session
- **THEN** the system applies those option sets to all drink selections in that session

### Requirement: Organizer can configure session submission policy
The system MUST allow the organizer to configure submission policy per session, including assigning eligible colleagues from the global roster.

#### Scenario: Assign roster to session
- **WHEN** the organizer selects colleagues from roster and sets an optional submission deadline
- **THEN** the system stores the policy and applies it to session form validation and submission acceptance

### Requirement: Session menu changes must preserve data integrity
The system MUST prevent destructive menu changes that would invalidate existing submitted orders without explicit confirmation.

#### Scenario: Attempt to remove an option already used by submitted orders
- **WHEN** the organizer tries to remove a drink option currently referenced by one or more orders
- **THEN** the system warns about impacted orders and requires explicit confirmation before applying the change