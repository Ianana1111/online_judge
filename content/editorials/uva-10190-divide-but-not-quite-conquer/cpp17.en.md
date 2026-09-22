The EOF loop processes every pair, including `0 0`. The initial guard makes subsequent modulo and division safe and guarantees progress for every accepted division.

The vector starts with n and appends only after an exact remainder-zero test. Nothing is output until final `current==1` is known. Success formatting places one space only before later terms; failure emits only the required phrase. Since computation only divides, `long long` intermediate values never grow.
