The parser reads width and height first and excludes only the pair zero-zero. Blocked coordinates are a set, so duplicate records have no extra effect.

`ways[0]=1` establishes the start. Rows include zero through height and columns zero through width. A blocked cell resets its entry; an open cell with `x>0` adds the already updated left entry without accessing a negative index.

Python integers preserve every intermediate count exactly. Three explicit result branches emit the required zero, singular, and plural sentences with normal ASCII apostrophes.
