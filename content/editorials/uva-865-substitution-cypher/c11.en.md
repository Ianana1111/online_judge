Create a 256-entry byte mapping initialized as `mapping[c]=c`. For each aligned alphabet position, overwrite the plaintext byte with its substitution byte. Then transform each content line by looking up every byte in order.

Identity initialization automatically preserves unmapped punctuation, digits, spaces, and case variants, avoiding special cases. Use full-line input so leading, internal, and trailing spaces survive. Only a truly zero-length line terminates a dataset; a line made solely of spaces must be processed. Rebuild the table for every case.

Start with an identity mapping for all bytes, then overwrite pairs given by the plaintext and substitution alphabets. Print both alphabets and translate each text line; unspecified punctuation and spaces remain unchanged.
