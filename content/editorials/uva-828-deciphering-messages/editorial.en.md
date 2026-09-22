# Validate the complete three-character wrapper before decoding it

## Problem and constraints

Each case supplies an ordered unique uppercase key `L`, a Caesar shift, and several ciphertext messages. A plaintext letter outside `L` is shifted alone. A plaintext letter in `L` is encoded as current key letter, shifted plaintext, next key letter; the key position advances for each wrapper and resets per message, not per word. Spaces remain unchanged. Invalid ciphertext prints `error in encryption`. The key and its shifted image are disjoint, ensuring unique decoding under the stated rules.

## Building the approach

Define inverse Caesar decoding and scan left to right. Copy a space without changing key position. At a nonspace position, first test a complete wrapper: at least three nonspace characters remain, endpoints match current and next key letters, and the middle character decodes to a member of the key. If valid, output its middle plaintext, advance three characters and the key position.

Otherwise try the single-character rule. It is legal only when the inverse-shifted character is outside the key. If it decodes into the key, neither grammar rule applies and the whole message is invalid.

An incomplete wrapper-like prefix may still be a legal ordinary character, so wrapper failure alone is not an error. Conversely, endpoints alone are insufficient because their middle must really encode a key letter.

## Walkthrough

With key `A` and shift one, plaintext `A` encrypts to `ABA` and decodes as one wrapper. Ciphertext `ACA` has matching endpoints, but `C` decodes to `B`, outside the key, so it is not a wrapper; its three characters decode separately to `ZBZ`. Across spaces, wrapper position continues rather than restarting.

## Why it works

A valid wrapper's middle decodes inside `L`, so it cannot be a legal single-character encoding. Because `L` and shifted `L` are disjoint, the grammar cannot reinterpret its shifted middle as a wrapper start. Thus a fully valid wrapper is the unique next token. When no valid wrapper exists, only the single rule can apply, and its outside-key test is exactly its legality condition. Induction over the scan therefore selects the unique legal token sequence, preserves spaces and key position, and reports an error exactly when no rule can consume the next character.

## Complexity

Each scan advances one or three characters, taking `O(M)` time and `O(M)` output space for message length `M`. Key membership is constant expected time with a set.

## Common mistakes

- Checking wrapper endpoints without validating the decoded middle.
- Reporting an error immediately when wrapper validation fails.
- Resetting key position at every word.
- Allowing a single character whose plaintext belongs to the key.
- Skipping empty message lines and shifting case boundaries.
