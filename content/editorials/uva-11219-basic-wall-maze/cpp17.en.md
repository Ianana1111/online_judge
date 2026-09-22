`readDate` consumes `day/month/year` but returns `(year,month,day)`, enabling standard tuple comparison to represent chronological order. Formatted extraction skips blank lines automatically.

A future birth date prints its message and immediately continues, so all later ages are nonnegative. The program subtracts once only when this year's birthday is still ahead, then uses the required strict comparison `age > 130`. All case punctuation and message capitalization match the judge format.
