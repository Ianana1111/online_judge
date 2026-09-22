"""Measured local domains: bounded subset output, small-area exact cover,
and exact recursively defined sequences with bounded intermediate digits."""
import argparse,hashlib,itertools,json,math,random,re
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
PART='gpe-2008-19-set-partition';TILE='uva-798-title-puzzle';SEQ='gpe-10503-show-the-sequence'
def subset_answers(values):
 assert 1<=len(values)<=30 and len(set(values))==len(values) and all(1<=x<=10**12 for x in values)
 total=sum(values)
 if total%2:return []
 values=sorted(values,reverse=True);n=len(values);suffix=[0]*(n+1);divisor=[0]*(n+1)
 for i in range(n-1,-1,-1):suffix[i]=suffix[i+1]+values[i];divisor[i]=math.gcd(divisor[i+1],values[i])
 out=[];chosen=[]
 def visit(i,needed):
  if needed==0:out.append(tuple(reversed(chosen)));return
  if i==n or needed<0 or needed>suffix[i] or needed%divisor[i]:return
  chosen.append(values[i]);visit(i+1,needed-values[i]);chosen.pop();visit(i+1,needed)
 visit(0,total//2);return sorted(out,key=lambda row:(len(row),row))
def partitions(data):
 lines=[line.strip() for line in data.splitlines() if line.strip()];assert lines[-1]=='.' and 1<=len(lines)-1<=50;out=[];count=0
 for line in lines[:-1]:
  assert re.fullmatch(r'\{\d+(?: +\d+)*\}',line);values=list(map(int,line[1:-1].split()));answers=subset_answers(values);count+=len(answers);assert count<=10000
  out.append(str(len(answers))+' subsets.\n'+'\n'.join('{'+ ' '.join(map(str,row))+'}' for row in answers) if answers else 'No such subset')
 return '\n\n'.join(out)+'\n'
def format_partitions(rows):return ''.join('{'+ ' '.join(map(str,row))+'}\n' for row in rows)+'.\n'

def tile_count(width,height,groups):
 area=width*height;full=(1<<area)-1;placements=[[] for _ in range(area)]
 for index,(count,a,b) in enumerate(groups):
  for w,h in {(a,b),(b,a)}:
   for row in range(height-h+1):
    for col in range(width-w+1):
     cells=[(row+y)*width+col+x for y in range(h) for x in range(w)];mask=sum(1<<cell for cell in cells)
     for cell in cells:placements[cell].append((index,mask))
 @lru_cache(None)
 def cover(free,remaining):
  if not free:return int(not any(remaining))
  best=None;scan=free
  while scan:
   bit=scan&-scan;cell=bit.bit_length()-1;scan-=bit
   options=[(g,m) for g,m in placements[cell] if remaining[g] and m&free==m]
   if not options:return 0
   if best is None or len(options)<len(best):best=options
   if len(best)==1:break
  answer=0
  for group,mask in best:
   new=list(remaining);new[group]-=1;answer+=cover(free^mask,tuple(new))
  return answer
 return cover(full,tuple(count for count,a,b in groups))
def all_tile_specs(limit=20):
 for width in range(1,limit+1):
  for height in range(width,limit//width+1):
   shapes=[(a,b) for a in range(1,width+1) for b in range(a,height+1)];current=[]
   def build(index,remaining):
    if remaining==0:
     if len(current)<=10:yield (width,height,tuple(current))
     return
    if index==len(shapes) or len(current)>10:return
    a,b=shapes[index]
    for count in range(remaining//(a*b)+1):
     if count:current.append((count,a,b))
     yield from build(index+1,remaining-count*a*b)
     if count:current.pop()
   yield from build(0,width*height)
def parse_tiles(data):
 values=list(map(int,data.split()));at=0;out=[]
 while at<len(values):
  w,h,n=values[at:at+3];at+=3;assert 1<=w<=100 and 1<=h<=100 and w*h<=20 and 1<=n<=10;groups=[]
  for _ in range(n):count,a,b=values[at:at+3];at+=3;assert min(count,a,b)>0;groups.append((count,a,b))
  assert len({tuple(sorted((a,b))) for count,a,b in groups})==n and sum(count*a*b for count,a,b in groups)==w*h
  out.append((w,h,groups))
 assert 1<=len(out)<=20;return out
def tiles(data):
 answers=[]
 for w,h,groups in parse_tiles(data):answer=tile_count(w,h,groups);assert answer>0;answers.append(str(answer))
 return '\n'.join(answers)+'\n'
def format_tiles(cases):return ''.join(f'{w} {h} {len(groups)}\n'+''.join(f'{count} {a} {b}\n' for count,a,b in groups) for w,h,groups in cases)

def parse_expression(expression):
 assert 1<=len(expression)<=200;at=0;nodes=[]
 def parse(depth):
  nonlocal at
  assert depth<=20 and expression[at]=='[';at+=1;match=re.match(r'-?\d+',expression[at:]);assert match
  value=int(match.group());assert abs(value)<=10**9;at+=len(match.group())
  if expression[at]==']':node=(value,None,None)
  else:
   operator=expression[at];at+=1;assert operator in ['+','*'] and value>0;child=parse(depth+1);node=(value,operator,child)
  assert expression[at]==']';at+=1;nodes.append(node);return node
 tree=parse(1);assert at==len(expression);return tree,nodes
def sequence_terms(expression,count):
 assert 2<=count<=50;tree,nodes=parse_expression(expression)
 @lru_cache(None)
 def term(node,index):
  value,operator,child=node
  if operator is None:answer=value
  elif operator=='+':answer=value+sum(term(child,j) for j in range(1,index))
  else:answer=value*math.prod(term(child,j) for j in range(1,index+1))
  assert abs(answer)<10**1000;return answer
 # Bottom-up validation prevents a huge hidden intermediate even when outer terms become zero.
 for node in nodes:
  for i in range(1,count+1):term(node,i)
 return [term(tree,i) for i in range(1,count+1)]
def sequences(data):
 lines=[line for line in data.splitlines() if line.strip()];assert 1<=len(lines)<=20;out=[]
 for line in lines:expression,n=line.split();out.append(' '.join(map(str,sequence_terms(expression,int(n)))))
 return '\n'.join(out)+'\n'

ORACLES={PART:partitions,TILE:tiles,SEQ:sequences}
def additions():
 rng=random.Random(200819)
 sizes=[19,16,12,12,12,11,7,7,7];output_boundary=[[i*50000000000 for i in range(1,n+1)] for n in sizes]
 assert sum(len(subset_answers(row)) for row in output_boundary)==10000
 base=[1<<i for i in range(29)]+[(1<<29)-1];max_cases=[]
 for scale in range(1,51):row=[value*scale for value in base];rng.shuffle(row);max_cases.append(row)
 small=[[1],[1,2,3],[1,2,4],[10**12,10**12-1,1]]
 for _ in range(30):small.append(rng.sample(range(1,101),rng.randrange(2,14)))
 tile_cases=[(4,5,[(6,1,1),(2,1,2),(2,1,3),(1,1,4)]),(1,20,[(10,1,2)]),(4,5,[(20,1,1)]),(4,4,[(4,2,2)]),(4,5,[(10,1,2)]),(3,6,[(3,1,2),(2,2,3)])]
 tile_cases+= [(h,w,groups) for w,h,groups in tile_cases if w!=h]
 expressions=[('[2+[1]]',50),('[2*[5+[-2]]]',50),('[1*[-1]]',50),('[1+[0]]',50),('[1000000000*[1*[10]]]',44),('[1*[1*[1*[2]]]]',25)]
 deep='[0]'
 for _ in range(19):deep='[1*'+deep+']'
 expressions.append((deep,50));deep='[1000000000]'
 for _ in range(19):deep='[1000000000+'+deep+']'
 # 20 literal-heavy levels exceed the separate200-character syntax cap; use small outer coefficients.
 deep='[1000000000]'
 for _ in range(19):deep='[1+'+deep+']'
 expressions.append((deep,50))
 return {PART:[format_partitions(small),format_partitions(output_boundary),format_partitions(max_cases)],TILE:[format_tiles(tile_cases),format_tiles([tile_cases[0]]*20)],SEQ:[''.join(f'{expression} {count}\n' for expression,count in expressions),('[1000000000*[1*[10]]] 44\n')*20]}
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
    try:answer=oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'measured local limits:10000total subsets,50full30-element datasets,area20tile worst-state case,20puzzles,depth20,N50,exact1000digits and20sequences','input':data,'output':oracle(data)})
  report['problems'].append(row);print(p['slug'],[(c['kind'],c['ord'],c['status']) for c in row['checks']],flush=True)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
