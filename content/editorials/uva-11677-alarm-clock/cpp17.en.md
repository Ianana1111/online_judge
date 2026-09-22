The input condition first reads all four integers and continues whenever at least one is nonzero, so midnight fields remain valid. Both times share one unit after multiplying hours by 60.

The conditional uses strict `finish > start`; equal or earlier targets receive the 1,440-minute rollover. This intentionally implements the platform's documented local equality behavior and prints only the duration.
