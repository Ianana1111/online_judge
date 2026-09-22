"""Directory prefix ordering, Grundy values, reverse ring arithmetic, rooted diameter and factorial."""
import argparse,hashlib,json,math,random,bisect
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def directories(paths):
 prefixes=set()
 for path in paths:
  parts=tuple(path.split('\\'))
  for end in range(1,len(parts)+1):prefixes.add(parts[:end])
 return '\n'.join(' '*(len(p)-1)+p[-1] for p in sorted(prefixes))

def disk(data):
 lines=data.splitlines();i=0;out=[];allowed=set("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&'()-@^_`{}~")
 while i<len(lines):
  if lines[i]=='':i+=1;continue
  n=int(lines[i]);i+=1;assert 1<=n<=500;paths=lines[i:i+n];i+=n;assert len(paths)==n and len(set(paths))==n
  for path in paths:assert 1<=len(path)<=80 and all(1<=len(p)<=8 and set(p)<=allowed for p in path.split('\\'))
  out.append(directories(paths))
 return '\n\n'.join(out)+'\n\n'

def grundy_wins(n,moves):
 grundy=bytearray(n+1)
 for value in range(1,n+1):
  seen=0
  for take in moves:
   if take<=value:seen|=1<<grundy[value-take]
  mex=0
  while seen>>mex&1:mex+=1
  grundy[value]=mex
 return bool(grundy[n])

def bachet(data):
 tokens=list(map(int,data.split()));i=0;out=[]
 while i<len(tokens):
  n,m=tokens[i:i+2];i+=2;moves=tokens[i:i+m];i+=m;assert 1<=n<=1000000 and 1<=m<=10 and len(moves)==m and 1 in moves and all(v>0 for v in moves);out.append('Stan wins' if grundy_wins(n,moves) else 'Ollie wins')
 return '\n'.join(out)+'\n'

def bee_coordinate(n):
 if n==1:return 0,0
 ring=max(1,(math.isqrt(12*n-3)-3)//6)
 while 1+3*ring*(ring+1)<n:ring+=1
 remaining=1+3*ring*(ring+1)-n;x,y=ring,0
 for dx,dy in [(0,-1),(-1,0),(-1,1),(0,1),(1,0),(1,-1)]:
  steps=min(remaining,ring);x+=steps*dx;y+=steps*dy;remaining-=steps
 assert remaining==0;return x,y

def bee(data):
 values=list(map(int,data.split()));assert values and all(1<=n<100000 for n in values);return ''.join(f'{x} {y}\n' for x,y in map(bee_coordinate,values))

def diameter(edges):
 adjacency={}
 for a,b,w in edges:assert a>0 and b>0 and a!=b and w>0;adjacency.setdefault(a,[]).append((b,w));adjacency.setdefault(b,[]).append((a,w))
 assert 2<=len(adjacency)<=10000 and len(edges)==len(adjacency)-1
 root=next(iter(adjacency));parents={root:None};order=[root]
 for a in order:
  for b,w in adjacency[a]:
   if b==parents[a]:continue
   assert b not in parents;parents[b]=a;order.append(b)
 assert len(order)==len(adjacency);down={};answer=0
 for a in reversed(order):
  branches=sorted((w+down[b] for b,w in adjacency[a] if parents[b]==a),reverse=True);down[a]=branches[0] if branches else 0;answer=max(answer,sum(branches[:2]))
 return answer

def roads(data):
 out=[];edges=[]
 for line in data.splitlines()+['']:
  if not line.strip():
   if edges:out.append(str(diameter(edges)));edges=[]
  else:edge=tuple(map(int,line.split()));assert len(edge)==3;edges.append(edge)
 return '\n'.join(out)+'\n'

def trees_value(n):return math.factorial(2*n)//math.factorial(n+1)
def trees(data):
 values=list(map(int,data.split()));assert values and values[-1]==0 and all(1<=n<=300 for n in values[:-1]);return ''.join(str(trees_value(n))+'\n' for n in values[:-1])
ORACLES={'gpe-10038-disk-tree':disk,'gpe-23681-bachet-s-game':bachet,'gpe-10551-bee-maja':bee,'gpe-24731-roads-in-the-north':roads,'gpe-10605-count-the-trees':trees}
def repair_input(slug,data):return None

def additions():
 rng=random.Random(10308);names=['!','#','$','%','&',"'",'(',')','-','@','^','_','`','{','}','~','A','AA','A0','Z','0','99999999'];paths={'APP\\BIN','APP\\DATA','APP','TEMP','APP\\BIN\\SUB','TEMP\\BIN','\\'.join(['A']*40)}
 paths|={f'ROOT\\{name}\\NODE' for name in names}
 while len(paths)<500:paths.add('\\'.join(rng.choice(names) for _ in range(rng.randrange(1,8))))
 graphs=[[(1,2,3),(2,3,4),(2,4,10)],[(1,2,1)],[(1,i,100+i) for i in range(2,80)],[(i,i+1,1+i%10000) for i in range(1,10000)]]
 for n in [7,30,200]:graphs.append([(v,rng.randrange(1,v),rng.randrange(1,1001)) for v in range(2,n+1)])
 games=[(n,[1,3,4]) for n in range(1,101)]+[(n,[1]) for n in range(1,21)]+[(1000000,[1,3,4,7]),(999999,list(range(1,11))),(1,[1,100])]
 return {'gpe-10038-disk-tree':'500\n'+'\n'.join(sorted(paths,reverse=True))+'\n\n1\nA\n\n','gpe-23681-bachet-s-game':''.join(f'{n} {len(m)} '+' '.join(map(str,m))+'\n' for n,m in games),'gpe-10551-bee-maja':'\n'.join(map(str,range(1,100000)))+'\n','gpe-24731-roads-in-the-north':'\n\n'.join('\n'.join(f'{a} {b} {w}' for a,b,w in e) for e in graphs)+'\n','gpe-10605-count-the-trees':'\n'.join(map(str,range(1,301)))+'\n0\n'}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args()
    output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/')
    output.mkdir(parents=True,exist_ok=True,mode=0o700)
    digest=lambda text:hashlib.sha256(text.encode()).hexdigest()
    normalize=lambda text:'\n'.join(line.rstrip(' \t\r') for line in text.split('\n')).strip('\n')
    snapshot=json.loads(Path(args.snapshot).read_text());extra=additions()
    report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
    for p in snapshot['problems']:
        oracle=ORACLES.get(p['slug'])
        if not oracle:continue
        spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}}
        row={'slug':p['slug'],'spec':spec,'checks':[],'proposedAdditions':[],'proposedReplacements':[]}
        for kind in ('samples','testCases'):
            for c in p[kind]:
                check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
                try:
                    answer=oracle(c['input']);check['status']='MATCH' if normalize(answer)==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
                    if p['slug']=='gpe-10038-disk-tree' and kind=='samples' and c['ord']==1 and check['status']=='WRONG_EXPECTED_OUTPUT':
                        assert answer.split()==c['output'].split()
                        row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':c['input'],'output':answer,'reason':'Restore exactly one indentation space per directory depth. Imported CERTCO~1 and X86 lines each had one extra leading space; names and order stay identical.'})
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Exact-input repair: append missing single-zero final sentinel after the valid sequence. Sequence values and expected numeric result are unchanged.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'full label and tree-size domains, grammar-level paths, noncontiguous subtraction sets, deep weighted trees and EOF dataset boundaries','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
