import sys
first=sys.stdin.buffer.readline()
if first:
    for case_number in range(1,int(first)+1):
        memory=[0]*100
        pointer=0
        for command in sys.stdin.buffer.readline():
            if command==62:
                pointer=(pointer+1)%100
            elif command==60:
                pointer=(pointer-1)%100
            elif command==43:
                memory[pointer]=(memory[pointer]+1)%256
            elif command==45:
                memory[pointer]=(memory[pointer]-1)%256
        print(f'Case {case_number}:'+''.join(f' {value:02X}' for value in memory))
