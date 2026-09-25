import sys
mirror={ch:ch for ch in b'AHIMOTUVWXY18'}
for left,right in zip(b'EJSZ',b'3L25'):
    mirror[left]=right
    mirror[right]=left
for word in sys.stdin.buffer.read().split():
    palindrome=word==word[::-1]
    mirrored=all(mirror.get(word[i])==word[-1-i] for i in range(len(word)))
    kind=('a mirrored palindrome.' if mirrored else 'a regular palindrome.') if palindrome else ('a mirrored string.' if mirrored else 'not a palindrome.')
    sys.stdout.buffer.write(word+b' -- is '+kind.encode()+b'\n\n')
