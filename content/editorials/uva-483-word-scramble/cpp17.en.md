The `flush` lambda performs reversal, output, and clearing in one shared operation, so separator handling and end-of-file handling cannot diverge. It captures `word` by reference and always acts on the current pending run.

`isspace` receives an `unsigned char` conversion, avoiding undefined behavior from negative signed `char` values. A separator is written immediately after the flush and never enters the reversed buffer. The final unconditional flush is harmless when empty and essential when no final newline exists.
