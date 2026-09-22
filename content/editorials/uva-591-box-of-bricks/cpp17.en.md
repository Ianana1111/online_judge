The first loop stores heights and accumulates `total`; divisibility guarantees `total/n` is exact. The second loop adds only `max(0, h-target)`, so deficient stacks are not counted a second time.

`moves` is reset per set and remains zero when heights already match. The zero sentinel is checked before division. Set numbering starts at one, and the fixed sentence, period, and two newline characters preserve the required layout.
