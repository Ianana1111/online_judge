Convert start and finish to integer minutes. Add a full day to finish when it is at or before start, then visit `[start, finish)` one minute at a time. Reducing each offset modulo 1440 identifies day, evening, or night and handles midnight naturally.

Count minutes first and compute the charge in integer cents to avoid rounding errors. Finally format the phone, three counts, plan, and charge at the required widths. Keep the phone number as a string throughout.
