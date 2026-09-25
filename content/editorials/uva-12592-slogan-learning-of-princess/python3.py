import sys
input=sys.stdin.buffer.readline
n=int(input())
responses={}
for _ in range(n):
    first=input().rstrip(b'\r\n')
    responses[first]=input().rstrip(b'\r\n')
answers=[responses[input().rstrip(b'\r\n')] for _ in range(int(input()))]
sys.stdout.buffer.write(b'\n'.join(answers)+(b'\n' if answers else b''))
