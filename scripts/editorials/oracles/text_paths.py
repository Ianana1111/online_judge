"""Independent string transduction, geometric rasterization, terminal slices, divisor hyperbola, permanent counts and keyboard product BFS."""
import argparse,array,collections,hashlib,itertools,json,math,random,re
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3];MOD=1000000007
def cipher(data):
 lines=data.splitlines();t=int(lines[0]);assert t>0;i=1;out=[]
 for _ in range(t):
  while i<len(lines) and lines[i]=='':i+=1
  plain,sub=lines[i:i+2];i+=2;assert 1<=len(plain)<=64 and len(plain)==len(sub) and len(set(plain))==len(plain);converted=[sub,plain];mapping=dict(zip(plain,sub))
  while i<len(lines) and lines[i]!='':
   assert len(lines[i])<=64;converted.append(''.join(mapping.get(ch,ch) for ch in lines[i]));i+=1
  out.append('\n'.join(converted))
 assert all(line=='' for line in lines[i:]);return '\n\n'.join(out)+'\n'
def graph_picture(s):
 edges=[];level=0
 for x,ch in enumerate(s):
  end=level+{'R':1,'F':-1,'C':0}[ch];edges.append((x,min(level,end),{'R':'/','F':'\\','C':'_'}[ch]));level=end
 top=max(y for x,y,ch in edges);bottom=min(y for x,y,ch in edges);rows=[]
 for y in range(top,bottom-1,-1):
  canvas=[' ']*len(s)
  for x,at,ch in edges:
   if at==y:canvas[x]=ch
  rows.append(('| '+''.join(canvas)).rstrip())
 return '\n'.join(rows)+'\n+'+'-'*(len(s)+2)+'\n'
def graphs(data):
 a=data.split();t=int(a[0]);assert t>0 and len(a)==t+1;out=[]
 for i,s in enumerate(a[1:],1):
  assert 1<=len(s)<=50 and set(s)<=set('RFC');out.append(f'Case #{i}:\n'+graph_picture(s))
 return '\n'.join(out)+'\n'
def terminal_image(lines):
 screen=[' '*10 for _ in range(10)];r=c=0;insert=False
 for line in lines:
  assert '\t' not in line;tokens=re.findall(r'\^[0-9][0-9]|\^[bcdehiloru^]|[^\^]',line);assert ''.join(tokens)==line
  for token in tokens:
   if token=='^b':c=0
   elif token=='^c':screen=[' '*10 for _ in range(10)]
   elif token=='^d':r=min(9,r+1)
   elif token=='^e':screen[r]=screen[r][:c]+' '*(10-c)
   elif token=='^h':r=c=0
   elif token=='^i':insert=True
   elif token=='^l':c=max(0,c-1)
   elif token=='^o':insert=False
   elif token=='^r':c=min(9,c+1)
   elif token=='^u':r=max(0,r-1)
   elif len(token)==3:r,c=map(int,token[1:])
   else:
    ch='^' if token=='^^' else token
    screen[r]=(screen[r][:c]+ch+screen[r][c:])[:10] if insert else screen[r][:c]+ch+screen[r][c+1:];c=min(9,c+1)
 return screen
def terminal(data):
 lines=data.splitlines();i=0;out=[];case=0
 while i<len(lines):
  n=int(lines[i]);i+=1;assert n>=0
  if n==0:assert i==len(lines);return '\n'.join(out)+'\n'
  chunk=lines[i:i+n];assert len(chunk)==n;i+=n;case+=1;out.extend([f'Case {case}','+----------+']+['|'+row+'|' for row in terminal_image(chunk)]+['+----------+'])
 raise AssertionError('missing terminal sentinel')
def divisor_total(n):
 root=math.isqrt(n);tri=lambda v:v*(v+1)//2
 return sum(d*(n//d)+tri(n//d) for d in range(1,root+1))-root*tri(root)-1
def mslcm(data):
 a=list(map(int,data.split()));assert a[-1]==0 and len(a)-1<=200 and all(1<n<20000001 for n in a[:-1]);return ''.join(str(divisor_total(n))+'\n' for n in a[:-1])
@lru_cache(None)
def factorial_by_primes(m):
 if m<2:return 1
 sieve=bytearray(b'\1')*(m+1);sieve[:2]=b'\0\0'
 for p in range(2,math.isqrt(m)+1):
  if sieve[p]:sieve[p*p::p]=b'\0'*((m-p*p)//p+1)
 value=1
 for p in range(2,m+1):
  if sieve[p]:
   exponent=0;power=p
   while power<=m:exponent+=m//power;power*=p
   value=value*pow(p,exponent,MOD)%MOD
 return value
def maximal_footrule(n):
 m=n//2;f=factorial_by_primes(m)
 # Count the permanent of the allowed low/high blocks, with three cases for the middle value.
 if n%2==0:return f*f%MOD
 middle_at_center=f*f%MOD;middle_at_left=m*f*f%MOD;middle_at_right=middle_at_left
 return (middle_at_center+middle_at_left+middle_at_right)%MOD
def permutations(data):
 a=list(map(int,data.split()));assert 1<=len(a)<=1000 and all(1<=n<=1000000 for n in a);return ''.join(str(maximal_footrule(n))+'\n' for n in a)
def keyboard_edges(grid):
 r=len(grid);c=len(grid[0]);edges=[set() for _ in range(r*c)]
 # A whole maximal equal-key row/column run jumps to the neighboring run boundary.
 for row in range(r):
  start=0
  while start<c:
   end=start+1
   while end<c and grid[row][end]==grid[row][start]:end+=1
   for col in range(start,end):
    if start:edges[row*c+col].add(row*c+start-1)
    if end<c:edges[row*c+col].add(row*c+end)
   start=end
 for col in range(c):
  start=0
  while start<r:
   end=start+1
   while end<r and grid[end][col]==grid[start][col]:end+=1
   for row in range(start,end):
    if start:edges[row*c+col].add((start-1)*c+col)
    if end<r:edges[row*c+col].add(end*c+col)
   start=end
 return [tuple(sorted(row)) for row in edges]
def keyboard_distance(grid,word):
 target=word+'*';letters=''.join(grid);size=len(letters);edges=keyboard_edges(grid);queue=collections.deque([0]);seen=bytearray(size*(len(target)+1));seen[0]=1;steps=0
 while queue:
  for _ in range(len(queue)):
   at,cell=divmod(queue.popleft(),size)
   if at==len(target):return steps
   if letters[cell]==target[at]:
    key=(at+1)*size+cell
    if not seen[key]:seen[key]=1;queue.append(key)
   for nxt in edges[cell]:
    key=at*size+nxt
    if not seen[key]:seen[key]=1;queue.append(key)
  steps+=1
 raise AssertionError('text must be reachable')
def disconnected_keys(grid):
 r=len(grid);c=len(grid[0]);letters=''.join(grid);broken=[]
 for ch in set(letters):
  cells={j for j,v in enumerate(letters) if v==ch};seen={next(iter(cells))};queue=list(seen)
  for cell in queue:
   row,col=divmod(cell,c)
   for nr,nc in [(row+1,col),(row-1,col),(row,col+1),(row,col-1)]:
    nxt=nr*c+nc
    if 0<=nr<r and 0<=nc<c and nxt in cells and nxt not in seen:seen.add(nxt);queue.append(nxt)
  if seen!=cells:broken.append(ch)
 return broken
def connected_relayout(grid):
 r=len(grid);c=len(grid[0]);letters=''.join(grid);counts=collections.Counter(letters);order=list(dict.fromkeys(letters));stream=''.join(ch*counts[ch] for ch in order);path=[(row,col) for row in range(r) for col in (range(c) if row%2==0 else range(c-1,-1,-1))];result=[['']*c for _ in range(r)]
 for (row,col),ch in zip(path,stream):result[row][col]=ch
 result=[''.join(row) for row in result];assert collections.Counter(''.join(result))==counts and result[0][0]==grid[0][0] and not disconnected_keys(result);return result
def repair_keyboards(data):
 a=data.split();i=0;out=[];changed=0
 while i<len(a):
  r,c=int(a[i]),int(a[i+1]);i+=2;grid=a[i:i+r];i+=r;word=a[i];i+=1
  if disconnected_keys(grid):grid=connected_relayout(grid);changed+=1
  out.append(f'{r} {c}\n'+'\n'.join(grid)+'\n'+word+'\n')
 return (''.join(out),changed) if changed else None
def keyboards(data):
 a=data.split();i=0;out=[];allowed=set('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-*')
 while i<len(a):
  r,c=int(a[i]),int(a[i+1]);i+=2;assert 1<=r<=50 and 1<=c<=50;grid=a[i:i+r];i+=r;word=a[i];i+=1;assert len(grid)==r and all(len(row)==c and set(row)<=allowed for row in grid);letters=''.join(grid);assert '*' in letters and 1<=len(word)<=10000 and '*' not in word and set(word)<=set(letters)
  assert not disconnected_keys(grid)
  out.append(str(keyboard_distance(grid,word)))
 return '\n'.join(out)+'\n'
ORACLES={'uva-865-substitution-cypher':cipher,'uva-10800-not-that-kind-of-graph':graphs,'uva-337-interpreting-control-sequence':terminal,'uva-1730-sum-of-mslcm':mslcm,'uva-13204-count-these-permutations':permutations,'uva-1714-keyboarding':keyboards}
def additions():
 rng=random.Random(337);alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 !';assert len(alphabet)==64;sub=list(alphabet);rng.shuffle(sub);sub=''.join(sub);ciphers=[('abc','bca',['abc cba xyz','  abc  ',' '*10]),(alphabet,sub,[alphabet,alphabet[::-1],'Hello, world! 0123456789','  '+alphabet[:60]+'  ']),('ab','ba',['abababab'])]
 words=[''.join(chars) for n in range(1,6) for chars in itertools.product('RFC',repeat=n)]+['R'*50,'F'*50,'C'*50,'RF'*25,'FR'*25,''.join(rng.choice('RFC') for _ in range(50))]
 commands=['^99AB^iCD^^^e^hZ','0123456789^b^iABC^05^oZ^e','^55text^cX^bY^hZ','^u^lA^99^d^rB','^00'+(' '*10)+'^h^^^i^^^r^^']
 for _ in range(45):
  tokens=[]
  for j in range(180):
   if rng.random()<.5:tokens.append(rng.choice(' abcXYZ0123!'))
   elif rng.random()<.2:tokens.append('^'+str(rng.randrange(10))+str(rng.randrange(10)))
   else:tokens.append('^'+rng.choice('bcdehiloru^'))
  commands.append(''.join(tokens))
 datasets=[[line] for line in commands]+[['abc','def','   ','ghi']]
 values=[2,3,4,10,20000000,19999999]+[rng.randint(2,20000000) for _ in range(150)]
 ns=list(range(1,31))+[999999,1000000,999998,10000,10001]
 layouts=[(['A*'],'A'*10000),(['AAA*'],'A'),(['AB*','ACC'],'ACBA'),(['ABCD','A**D'],'ADAD'),(['AAB*','CCC*'],'ACBCA')]
 bands='ABCDEFGHIJKLMNOPQRSTUVWX*';large=''.join(ch*2 for ch in bands);layouts.append(([large]*50,'AX'*5000))
 return {'uva-865-substitution-cypher':[str(len(ciphers))+'\n\n'+'\n\n'.join(plain+'\n'+sub+'\n'+'\n'.join(lines) for plain,sub,lines in ciphers)+'\n'],'uva-10800-not-that-kind-of-graph':[str(len(words))+'\n'+'\n'.join(words)+'\n'],'uva-337-interpreting-control-sequence':[''.join(str(len(lines))+'\n'+'\n'.join(lines)+'\n' for lines in datasets)+'0\n'],'uva-1730-sum-of-mslcm':['\n'.join(map(str,values))+'\n0\n'],'uva-13204-count-these-permutations':['\n'.join(map(str,ns))+'\n'],'uva-1714-keyboarding':[''.join(f'{len(grid)} {len(grid[0])}\n'+'\n'.join(grid)+'\n'+word+'\n' for grid,word in layouts)]}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args();output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/');output.mkdir(parents=True,exist_ok=True,mode=0o700)
 digest=lambda s:hashlib.sha256(s.encode()).hexdigest();normalize=lambda s:'\n'.join(line.rstrip(' \t\r') for line in s.split('\n')).strip('\n');snapshot=json.loads(Path(args.snapshot).read_text());extra=additions();report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
 for p in snapshot['problems']:
  oracle=ORACLES.get(p['slug'])
  if not oracle:continue
  spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}};row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
  for kind in ('samples','testCases'):
   for c in p[kind]:
    check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
    try:
     answer=oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
     if check['status']=='WRONG_EXPECTED_OUTPUT' and kind=='samples' and p['slug'] in ['uva-10800-not-that-kind-of-graph','uva-337-interpreting-control-sequence']:
      row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Correct public sample spacing against the exact graph/10-column-screen specification; preserve every input command and character. Independent geometric rasterization or terminal string-slice simulation certifies the output; source PDF confirms one-character strokes and fixed-width screen.'})
    except (AssertionError,ValueError,IndexError,StopIteration):
     check['status']='INPUT_REQUIRES_REVIEW'
     if p['slug']=='uva-1714-keyboarding':
      repair=repair_keyboards(c['input'])
      if repair:
       corrected,changed=repair;row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':f'Rebuild {changed} illegal disconnected-key layouts as contiguous runs along a serpentine Hamiltonian path. Preserve every grid dimension, exact per-character cell multiplicity, original starting key and entire requested text; leave already connected layouts unchanged. This changes navigation topology and requires recomputing answers, rather than treating the old invalid cases as valid stress tests.'})
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'64character substitution with spaces,exhaustive shortgraphs,all terminal controls and boundaries,20million divisor total,one-million maximum displacement and50x50/10000keyboard inputs','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
