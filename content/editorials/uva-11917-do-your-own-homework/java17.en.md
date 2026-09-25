Build a map from subject name to completion days. Use `find` for the requested subject. Absence immediately gives the rejection message. For a found subject, classify days into `<=D`, `D+1..D+5`, or above `D+5`.

Avoid reading with `days[wanted]`: map subscripting inserts a missing key with zero and could make an unknown subject appear finishable on time.

Map subject names to completion days; test the deadline first, then the five-day grace period.
