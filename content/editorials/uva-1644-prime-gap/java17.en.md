Use the Sieve of Eratosthenes through the inclusive upper bound and collect every prime in increasing order. For a query, `lower_bound` finds the first prime at least k. If it equals k, print zero; otherwise it is the upper endpoint and its predecessor is the lower endpoint.

The constraints guarantee a composite query is above two and every query has a found upper prime, so predecessor and dereference are safe in their respective branches.

The stated upper bound is prime, ensuring the upper search remains inside the table.
