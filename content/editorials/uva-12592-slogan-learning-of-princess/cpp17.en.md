Both numeric reads are followed by `ignore` through the newline, so the next `getline` starts with real content. Each pair is read first line then second line and stored directly.

A trailing `\r` is removed only when present; all other spaces remain untouched. `responses.at(first)` expresses the guarantee that every query exists and avoids inserting a missing key. Output consists solely of the stored response and a newline.
