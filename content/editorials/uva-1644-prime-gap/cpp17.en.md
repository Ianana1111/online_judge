Entries zero and one are explicitly nonprime. Composite marking begins at `p*p`, and both sieve loops include the legal upper bound, preserving its final prime.

Prime values are appended in increasing numeric order, satisfying binary-search requirements. Equality is checked before taking `prev`, protecting the smallest prime. Only composite queries subtract neighboring endpoints, with no minus one, and the sentinel exits before lookup.
