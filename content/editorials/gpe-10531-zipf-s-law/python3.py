import collections
import re
import sys
lines=sys.stdin.buffer.read().splitlines();at=0;blocks=[]
while at<len(lines):
    header=lines[at].split();at+=1
    if not header:continue
    target=min(10001,int(header[0]));count=collections.Counter()
    while at<len(lines) and lines[at]!=b'EndOfText':
        count.update(word.decode() for word in re.findall(rb'[A-Za-z]+',lines[at].lower()))
        at+=1
    at+=1
    words=sorted(word for word,times in count.items() if times==target)
    blocks.append('\n'.join(words) if words else 'There is no such word.')
sys.stdout.write('\n\n'.join(blocks)+'\n' if blocks else '')
