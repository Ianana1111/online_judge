import sys
tokens=iter(sys.stdin.buffer.read().split())
irregular_count,queries=int(next(tokens)),int(next(tokens))
irregular={next(tokens):next(tokens) for _ in range(irregular_count)}
for _ in range(queries):
    word=next(tokens)
    if word in irregular:
        answer=irregular[word]
    elif len(word)>=2 and word.endswith(b'y') and word[-2] not in b'aeiou':
        answer=word[:-1]+b'ies'
    elif word.endswith((b'o',b's',b'ch',b'sh',b'x')):
        answer=word+b'es'
    else:
        answer=word+b's'
    sys.stdout.buffer.write(answer+b'\n')
