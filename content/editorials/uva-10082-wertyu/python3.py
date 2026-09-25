import sys
rows = (b'`1234567890-=', b'QWERTYUIOP[]\\', b"ASDFGHJKL;'", b'ZXCVBNM,./')
decode = bytes.maketrans(b''.join(row[1:] for row in rows), b''.join(row[:-1] for row in rows))
sys.stdout.buffer.write(sys.stdin.buffer.read().translate(decode))
