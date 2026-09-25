import sys
def digit(ch):
    if 48<=ch<=57:
        return ch-48
    if 65<=ch<=90:
        return ch-65+10
    return ch-97+36
for text in sys.stdin.buffer.read().split():
    values=[digit(ch) for ch in text if ch not in (43,45)]
    total=sum(values)
    maximum=max(values,default=0)
    answer=next((base for base in range(max(2,maximum+1),63) if total%(base-1)==0),None)
    print(answer if answer is not None else 'such number is impossible!')
