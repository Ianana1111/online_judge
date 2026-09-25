Treat each physical line as one record. Parse only its first word as the country; the remaining name does not affect classification. Increment that key in an ordered `map<string,int>`.

Reading complete lines is important. If the whole file were consumed as a stream of words, the second or third word of a name could be mistaken for the country of the next record. Assuming every name has a fixed word count would fail for the same reason.

An ordered map keeps its country keys lexicographically sorted, so a final traversal already has the required output order.

Use only the country before the first space on each line, ignore the name, and print counts in country order.
