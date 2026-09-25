import sys
lines=[line.rstrip(b'\r\n') for line in sys.stdin.buffer]
width=max(map(len,lines),default=0)
for column in range(width):
    sys.stdout.buffer.write(bytes(line[column] if column<len(line) else 32 for line in reversed(lines))+b'\n')
