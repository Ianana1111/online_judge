The first task is to define a reliable identity for a combination. The five input numbers cannot be used in their original order, and their sum loses information because different sets can share a sum. Sorting the five numbers gives a unique representation of the set.

Use that sorted array as a map key and count how many students chose it. Then find the largest frequency. Finally add the frequencies of all keys attaining that maximum.

Keep the requested output in mind: it is a number of students, not a number of combinations or just the maximum frequency. If every combination is different, they all tie at frequency one, and every student wins.

Sort each five-course selection so order does not matter; add all students across every combination tied for maximum frequency.
