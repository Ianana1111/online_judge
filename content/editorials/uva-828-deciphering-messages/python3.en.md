`decode_message` resets `position` per message. The space branch advances only the input index. Short-circuit wrapper checks avoid indexing a missing key or incomplete suffix and reject spaces inside the three-character token.

The wrapper and ordinary branches use opposite decoded-key membership conditions, directly matching the encryption grammar. Only failure of both returns the error string. Input parsing preserves a possible empty key and then consumes exactly the declared number of message lines, including empty lines. Results are separated by one blank line between cases.
