The call time stays fixed throughout forwarding. At that time, each extension therefore has either no active successor or one unique successor. Starting from the called extension, repeatedly scan the rules for the active rule whose source is the current extension.

If no rule exists, the current extension rings. Otherwise move to its target and continue. Record every visited extension for this call. Reaching any previously visited extension means the deterministic process will repeat the same suffix forever, so the answer is 9999.

Checking only whether we return to the original extension is insufficient: a chain such as `A -> B -> C -> B` enters a cycle that excludes `A`. A zero-duration rule is active at exactly its start time, so both interval comparisons require equality.

For each call, repeatedly apply the first active forwarding rule for the current extension. Track visited extensions for that call; a repeat rings 9999. Print times and extensions using four digits.
