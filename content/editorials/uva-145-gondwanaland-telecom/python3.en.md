A call lasts at most 1440 minutes, so classify each minute directly. Convert times to minute offsets, add 1440 to finish when it is at or before start, then traverse the half-open interval so the ending minute is excluded. Modulo 1440 maps every minute back to its daily tariff period.

Multiply the three counts by rates stored in cents, then print fixed-width fields and two decimal digits. Do not parse the phone number as an integer: it may have leading zeroes.
