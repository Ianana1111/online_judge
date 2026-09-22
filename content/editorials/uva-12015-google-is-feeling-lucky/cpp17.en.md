The ten-element vector stores URL-score pairs. Starting `best` at zero is safe because legal scores are positive, so the first record updates it.

The input loop only stores and maximizes; the output loop does not modify or reorder records. Equality prints every tie. Case numbering begins at one and the header includes both `#` and colon.
