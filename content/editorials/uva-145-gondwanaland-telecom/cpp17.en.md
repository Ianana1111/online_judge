The rate matrix stores cents in day, evening, night order, indexed by `step-'A'`. Encountering `#` stops before reading the remaining record.

`finish<=start` implements both midnight crossing and the full-day equality case. Each minute is classified after modulo 1,440 using exact half-open boundaries. Integer cents are converted to a string with a padded two-digit remainder, then fields use widths 10,6,6,6,3,8; each `setw` applies only to its immediately following value.
