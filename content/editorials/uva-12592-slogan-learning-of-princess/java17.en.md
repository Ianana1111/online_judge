Store each complete first line as a dictionary key and the following complete line as its value. Read with `getline`, because token input would stop at the first space and misalign all remaining words.

After reading each numeric count with formatted input, discard the remainder of that line before the next `getline`. Preserve all content spaces; remove only a trailing carriage return that belongs to Windows line endings.

Read each slogan and response as full lines because the text can contain spaces.
