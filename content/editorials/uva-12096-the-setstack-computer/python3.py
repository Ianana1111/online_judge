import sys

tokens = iter(sys.stdin.buffer.read().split())
answers = []
for _ in range(int(next(tokens))):
    ids = {}
    values = []

    def intern(value):
        if value not in ids:
            ids[value] = len(values)
            values.append(value)
        return ids[value]

    empty = intern(frozenset())
    stack = []
    for _ in range(int(next(tokens))):
        command = next(tokens)
        if command == b'PUSH':
            stack.append(empty)
        elif command == b'DUP':
            stack.append(stack[-1])
        else:
            a, b = stack.pop(), stack.pop()
            if command == b'UNION':
                result = values[a] | values[b]
            elif command == b'INTERSECT':
                result = values[a] & values[b]
            else:
                result = values[b] | frozenset([a])
            stack.append(intern(result))
        answers.append(str(len(values[stack[-1]])))
    answers.append('***')
if answers:
    print('\n'.join(answers))
