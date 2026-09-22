The explicit `alphabet` string encodes uppercase-before-lowercase order independently of locale. Input characters are held as `unsigned char`, and only ASCII letter ranges index the fixed count array; other bytes, including a possible carriage return, are ignored.

Both `count` and `best` are recreated inside each `getline` iteration. The output loop includes `best > 0`, so a letterless line prints no letters and then the common space-plus-frequency suffix. Tied letters are concatenated without separators.
