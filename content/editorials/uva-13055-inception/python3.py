import sys


tokens = sys.stdin.buffer.read().split()
index = 1
dreams = []
answers = []
for _ in range(int(tokens[0])):
    command = tokens[index]
    index += 1
    if command == b"Sleep":
        dreams.append(tokens[index])
        index += 1
    elif command == b"Kick":
        if dreams:
            dreams.pop()
    elif command == b"Test":
        answers.append(dreams[-1] if dreams else b"Not in a dream")
sys.stdout.buffer.write(b"\n".join(answers))
