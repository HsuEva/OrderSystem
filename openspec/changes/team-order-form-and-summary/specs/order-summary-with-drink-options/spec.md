## ADDED Requirements

### Requirement: System provides food item quantity summary
The system MUST generate a summary that aggregates total quantities for each food item within a session.

#### Scenario: Generate food summary from submitted orders
- **WHEN** the organizer requests session statistics
- **THEN** the system returns each food item with its aggregated total quantity

### Requirement: System provides drink summary grouped by customization tuple
The system MUST generate drink statistics grouped by drink item, sweetness level, and ice level combination.

#### Scenario: Generate drink summary with sweetness and ice dimensions
- **WHEN** the organizer requests session statistics
- **THEN** the system returns grouped totals keyed by drink item + sweetness level + ice level

### Requirement: Summary must reflect latest valid submissions
The system MUST compute statistics from the latest valid submission per colleague according to the duplicate handling rule.

#### Scenario: Recompute summary after colleague updates order
- **WHEN** a colleague replaces a previous submission in the same session
- **THEN** the next statistics result reflects only the latest submission from that colleague

### Requirement: Organizer can export summary and order details as CSV
The system MUST provide CSV exports for latest valid order details and aggregated statistics for a session.

#### Scenario: Export statistics CSV
- **WHEN** the organizer triggers export for a session
- **THEN** the system generates downloadable CSV files containing food totals and drink totals grouped by drink item + sweetness + ice level