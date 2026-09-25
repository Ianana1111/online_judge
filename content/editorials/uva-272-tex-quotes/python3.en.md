A quotation can span lines, so matching quotes line by line would lose the state at a newline. Treat the entire input as one character stream and keep only whether the next double quote opens a quotation. Emit two backticks for an opening quote or two apostrophes for a closing quote, then flip the state. Copy every other character, including whitespace and existing apostrophes, unchanged. Consequently odd-numbered double quotes open and even-numbered ones close.

Byte input and output preserve the exact original whitespace; `bytearray` accumulates the transformed stream.
