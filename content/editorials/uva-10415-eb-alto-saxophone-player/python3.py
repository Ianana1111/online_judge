import sys
notes=b'cdefgabCDEFGAB'
pressed=(b'2347890',b'234789',b'23478',b'2347',b'234',b'23',b'2',b'3',b'1234789',b'123478',b'12347',b'1234',b'123',b'12')
first=sys.stdin.buffer.readline()
if first:
    for _ in range(int(first)):
        song=sys.stdin.buffer.readline().rstrip(b'\r\n')
        count=[0]*10
        previous=[False]*10
        for note in song:
            current=[False]*10
            for key in pressed[notes.index(note)]:
                current[9 if key==48 else key-49]=True
            for i in range(10):
                if current[i] and not previous[i]:
                    count[i]+=1
            previous=current
        print(*count)
