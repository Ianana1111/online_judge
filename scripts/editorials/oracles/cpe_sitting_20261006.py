"""Independent oracles for the CPE 2026-10-06 sitting: literal f91 recursion, list-index card
simulation, dominance-checked lexicographic placement, hashed pair sums, simple-path enumeration
with exact fare rounding, and an O(n^2) minimum-weight stack DP."""
import argparse,hashlib,json,random,re
from fractions import Fraction
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]

def f91(data):
 values=list(map(int,data.split()));assert values and values[-1]==0 and values.count(0)==1 and len(values)-1<=250000
 memo={};out=[]
 def literal(n):
  # Evaluate the nested definition with an explicit pending-call counter, not the closed form.
  if n in memo:return memo[n]
  pending,x=1,n
  while pending:
   if x>=101:x-=10;pending-=1
   else:x+=11;pending+=1
  memo[n]=x;return x
 for n in values[:-1]:
  assert 1<=n<=1000000
  out.append(f'f91({n}) = {literal(n)}')
 return '\n'.join(out)+'\n'

def cards(data):
 values=list(map(int,data.split()));assert values and values[-1]==0 and values.count(0)==1 and len(values)-1<=1000;out=[]
 for n in values[:-1]:
  assert 1<=n<=10000
  deck=list(range(1,n+1));head=0;thrown=[]
  while len(deck)-head>=2:
   thrown.append(deck[head]);deck.append(deck[head+1]);head+=2
  out.append('Discarded cards:'+(' '+', '.join(map(str,thrown)) if thrown else ''))
  out.append(f'Remaining card: {deck[head]}')
 return '\n'.join(out)+'\n'

def dominance_ok(n,counts,seq):
 # Twice the distance from the middle pigeonhole (n+1)/2 keeps even n integral.
 levels={}
 for i in range(n):levels.setdefault(abs(2*(i+1)-(n+1)),[]).append(counts[seq[i]])
 ordered=[levels[k] for k in sorted(levels,reverse=True)]
 return all(min(far)>=max(near) for far,near in zip(ordered,ordered[1:]))
def completion(n,counts,fixed):
 free=sorted((i for i in range(n) if fixed[i] is None),key=lambda i:-abs(2*(i+1)-(n+1)))
 rest=sorted((w for w in range(n) if w not in fixed),key=lambda w:-counts[w])
 seq=list(fixed)
 for i,w in zip(free,rest):seq[i]=w
 return seq
def pigeonholes(data):
 tokens=data.split();m=int(tokens[0]);assert 1<=m<=1000;pos=1;out=[]
 for _ in range(m):
  n=int(tokens[pos]);text=tokens[pos+1];pos+=2
  assert 1<n<26 and text.endswith('#') and re.fullmatch('[A-Z]*',text[:-1]) and len(text)<=10001
  counts=[text.count(chr(65+w)) for w in range(n)]
  fixed=[None]*n
  for i in range(n):
   for w in range(n):
    if w in fixed:continue
    fixed[i]=w
    if dominance_ok(n,counts,completion(n,counts,fixed)):break
    fixed[i]=None
   assert fixed[i] is not None
  out.append(' '.join(chr(65+w) for w in fixed));out.append(' '.join(str(counts[w]) for w in fixed))
 assert pos==len(tokens)
 return '\n'.join(out)+'\n'

def sumsets(data):
 values=list(map(int,data.split()));pos=0;out=[]
 while values[pos]!=0:
  n=values[pos];s=values[pos+1:pos+1+n];pos+=n+1
  assert 1<=n<=1000 and len(s)==n and len(set(s))==n and all(-536870912<=x<=536870911 for x in s)
  sums={}
  for i in range(n):
   for j in range(i+1,n):sums.setdefault(s[i]+s[j],[]).append((i,j))
  best=None
  for d in sorted(range(n),key=lambda k:-s[k]):
   if any(i not in (c,d) and j not in (c,d) for c in range(n) if c!=d for i,j in sums.get(s[d]-s[c],())):best=s[d];break
  out.append('no solution' if best is None else str(best))
 assert pos==len(values)-1
 return '\n'.join(out)+'\n'

def cheapest(data):
 tokens=data.split();pos=0
 def take():
  nonlocal pos;pos+=1;return tokens[pos-1]
 maps=int(take());assert 1<=maps<=1000;blocks=[]
 for number in range(1,maps+1):
  n=int(take());assert 0<n<20;names=[];fee={}
  for _ in range(n):
   name,money=take(),int(take());assert re.fullmatch('[a-z0-9]{1,30}',name) and name not in fee and 0<=money<=1000
   names.append(name);fee[name]=money
  paths=int(take());assert 0<paths<20;road={}
  for _ in range(paths):
   a,b,km=take(),take(),int(take());assert a in fee and b in fee and a!=b and 1<=km<=1000
   key=frozenset((a,b));road[key]=min(road.get(key,km),km)
  queries=int(take());assert 0<queries<10;lines=[f'Map #{number}']
  for q in range(1,queries+1):
   a,b,people=take(),take(),int(take());assert a in fee and b in fee and a!=b and 1<=people<=10000
   found=[]
   def walk(node,seen,cost):
    if node==b:found.append((cost,list(seen)));return
    for other in names:
     key=frozenset((node,other))
     if other not in seen and key in road:seen.append(other);walk(other,seen,cost+2*road[key]+fee[other]);seen.pop()
   walk(a,[a],fee[a])
   assert found;best=min(c for c,_ in found);routes=[r for c,r in found if c==best];assert len(routes)==1
   cents=int(Fraction(best*110,people)+Fraction(1,2))
   lines+= [f'Query #{q}',' '.join(routes[0]),f'Each passenger has to pay : {cents//100}.{cents%100:02d} taka']
  blocks.append('\n'.join(lines))
 assert pos==len(tokens)
 return '\n\n'.join(blocks)+'\n'

def turtles(data):
 lines=[line.split() for line in data.splitlines() if line.strip()];assert 1<=len(lines)<=5607
 items=[]
 for parts in lines:
  assert len(parts)==2;w,s=map(int,parts);assert 1<=w<=200000 and 1<=s<=200000;items.append((s,w))
 items.sort()
 # best[k] = lightest total weight of a valid k-turtle stack using turtles seen so far; each new,
 # stronger turtle can only be placed below every earlier choice.
 inf=float('inf');best=[0]+[inf]*len(items)
 for k,(s,w) in enumerate(items):
  for size in range(k,-1,-1):
   if best[size]+w<=s and best[size]+w<best[size+1]:best[size+1]=best[size]+w
 return f'{max(k for k,v in enumerate(best) if v!=inf)}\n'

ORACLES={'uva-10696-f91':f91,'uva-10935-throwing-cards-away-i':cards,'uva-10665-diatribe-against-pigeonholes':pigeonholes,'uva-10125-sumsets':sumsets,'uva-10436-cheapest-way':cheapest,'uva-10154-weights-and-measures':turtles}

def additions():
 rng=random.Random(20261006)
 small=list(range(1,121))+[1000000,999999,101,100,91,90,111,110,1]
 heavy=[rng.randrange(1,101) if rng.random()<0.3 else rng.randrange(1,1000001) for _ in range(250000-11)]+[1,100,101,102,1000000,999999,91,90,111,110,11]
 rng.shuffle(heavy)
 decks=list(range(1,51));big=[10000,9999,8192,8193,4096,4097,1,2,3]+[rng.randrange(1,10001) for _ in range(21)]
 def letters(n,size,skew):
  alphabet=[chr(65+w) for w in range(min(26,n+skew))]
  return ''.join(rng.choice(alphabet) for _ in range(size))
 holes=[(2,''),(2,'A'),(2,'B'),(2,'AB'),(3,'CCBBAA'),(25,''),(25,'ABCDEFGHIJKLMNOPQRSTUVWXY'),(25,'Z'*40),(5,'EEDDCCBBAA'),(6,'FFFEEEDDCCBA'),(4,'AAAABBBBCCCCDDDD'),(24,'XWVUTSRQPONMLKJIHGFEDCBAXWV'),(7,'GGGGGGG'),(9,'ABABABABCDCDCDCDEFEFGHI')]
 holes+=[(n,letters(n,rng.randrange(0,30),rng.randrange(0,3))) for n in [rng.randrange(2,26) for _ in range(40)]]
 stress=[(n,letters(n,rng.randrange(0,1001),rng.randrange(0,4))) for n in [rng.randrange(2,26) for _ in range(976)]]
 stress+= [(n,''.join(chr(65+rng.randrange(0,max(1,n//3)))*rng.randrange(0,5) for _ in range(rng.randrange(0,60)))) for n in range(2,26)]
 sets=[[5],[1,2],[1,2,3],[1,2,3,6],[1,2,5,100],[-3,3,7,1],[-1,0,1,5],[0,1,2,3,4],[-536870912,536870911,536870910,536870909,-1],[-536870912,-536870911,-536870910,536870911,-1073741821],[10,20,30,60,-5,-15,-10],[-9,-3,-2,-4,-14],[2,16,64,256,1024]]
 sets=[[x for x in s if -536870912<=x<=536870911] for s in sets]
 def unique(count,low,high):
  seen=set()
  while len(seen)<count:seen.add(rng.randint(low,high))
  return list(seen)
 big_sets=[unique(1000,-536870912,536870911) for _ in range(3)]+[unique(1000,-3000,3000),unique(1000,1,10**6),unique(999,-536870912,536870911)]
 tail=unique(997,1,10**8);big_sets.append(tail+[max(tail)+3*10**8+1,10**8+1,2*10**8+0])
 def word():
  return ''.join(rng.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(rng.randrange(1,16)))
 def build_map(n,extra,queries):
  while True:
   names=[]
   while len(names)<n:
    w=word()
    if w not in names:names.append(w)
   fees={x:rng.randrange(0,101) for x in names};edges=[]
   for i in range(1,n):edges.append((names[rng.randrange(0,i)],names[i],rng.randrange(1,101)))
   for _ in range(extra):
    a,b=rng.sample(names,2);edges.append((a,b,rng.randrange(1,101)))
   edges=edges[:19];rng.shuffle(edges)
   text=f'{n}\n'+''.join(f'{x} {fees[x]}\n' for x in names)+f'{len(edges)}\n'+''.join(f'{a} {b} {k}\n' for a,b,k in edges)
   picked=[]
   for _ in range(200):
    a,b=rng.sample(names,2);people=rng.choice([1,2,3,4,7,8,30,99,100,1000,9999,10000,rng.randrange(1,101)])
    try:cheapest(f'1\n{text}1\n{a} {b} {people}\n')
    except AssertionError:continue
    picked.append(f'{a} {b} {people}')
    if len(picked)==queries:return text+f'{queries}\n'+''.join(q+'\n' for q in picked)
 chain='19\n'+''.join(f's{i} {i%7}\n' for i in range(19))+'19\n'+''.join(f's{i} s{i+1} {i+1}\n' for i in range(18))+'s0 s18 500\n'
 chain+='5\ns0 s18 1\ns18 s0 10000\ns3 s15 4\ns9 s10 8\ns18 s1 7\n'
 halves='3\nx 0\ny 0\nz 1\n3\nx y 1\ny z 1\nx z 1\n4\nx y 4\nx y 8\ny x 400\nx z 4\n'
 parallel='4\nalpha 5\nbeta 5\ngamma 5\ndelta 5\n4\nalpha beta 10\nalpha beta 3\nbeta gamma 2\ngamma delta 1\n2\nalpha delta 6\ndelta alpha 1\n'
 maps=[chain,halves,parallel]+[build_map(rng.randrange(2,20),rng.randrange(0,6),rng.randrange(1,10)) for _ in range(12)]
 stress_maps=[build_map(rng.randrange(10,20),rng.randrange(0,8),9) for _ in range(300)]
 turtle_edge=[(300,1000),(1000,1200),(200,600),(100,101),(5,4),(7,7),(1,1),(200000,200000),(200000,199999),(3,10),(4,10),(5,10),(6,10)]
 trap=[(1,5),(3,5),(4,7),(10,20),(2,3),(2,3),(2,3)]
 turtle_stress=[(rng.randrange(1,200001),rng.randrange(1,200001)) for _ in range(5607)]
 for i in range(0,5607,3):
  w=rng.randrange(1,40);turtle_stress[i]=(w,w+rng.randrange(0,200000-w+1))
 return {
  'uva-10696-f91':[('boundaries around 100/101, the 1000000 limit and repeats','\n'.join(map(str,small))+'\n0\n'),('250000 values with many recursive-branch inputs','\n'.join(map(str,heavy))+'\n0\n')],
  'uva-10935-throwing-cards-away-i':[('every n from 1 to 50 including the single-card line','\n'.join(map(str,decks))+'\n0\n'),('CPE-scale decks up to 10000 and powers of two','\n'.join(map(str,big))+'\n0\n')],
  'uva-10665-diatribe-against-pigeonholes':[('empty strings, all-equal counts, ties across tiers and ignored letters',f'{len(holes)}\n'+''.join(f'{n}\n{s}#\n' for n,s in holes)),('1000 random cases with dense ties',f'{len(stress)}\n'+''.join(f'{n}\n{s}#\n' for n,s in stress))],
  'uva-10125-sumsets':[('reused-element traps, negatives, extremes and tiny sets',''.join(f'{len(s)}\n'+''.join(f'{x}\n' for x in s) for s in sets)+'0\n'),('seven sets near n=1000 with and without answers',''.join(f'{len(s)}\n'+''.join(f'{x}\n' for x in s) for s in big_sets)+'0\n')],
  'uva-10436-cheapest-way':[('long chains, exact half-cent rounding, parallel roads and random small maps',f'{len(maps)}\n'+'\n'.join(maps)),('300 maps with nine unique-path queries each',f'{len(stress_maps)}\n'+'\n'.join(stress_maps))],
  'uva-10154-weights-and-measures':[('overweight turtles, exact capacity, equal strengths and an exchange trap',''.join(f'{w} {s}\n' for w,s in turtle_edge+trap)),('5607 random turtles with many light ones',''.join(f'{w} {s}\n' for w,s in turtle_stress))],
 }

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--snapshot',required=True);parser.add_argument('--out',required=True);args=parser.parse_args()
    output=Path(args.out).resolve();assert output.is_relative_to(ROOT/'generated') or str(output).startswith('/private/tmp/')
    output.mkdir(parents=True,exist_ok=True,mode=0o700)
    digest=lambda text:hashlib.sha256(text.encode()).hexdigest()
    normalize=lambda text:'\n'.join(line.rstrip(' \t\r') for line in text.split('\n')).strip('\n')
    snapshot=json.loads(Path(args.snapshot).read_text())
    report={'oracleHash':hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),'snapshotHash':snapshot['contentHash'],'problems':[]}
    for p in snapshot['problems']:
        oracle=ORACLES.get(p['slug'])
        if not oracle:continue
        spec={'statementHash':digest(p['statementMd']),'inputSpecHash':digest(p['inputSpecMd']),'outputSpecHash':digest(p['outputSpecMd']),**{k:p[k] for k in ['sourceUrl','uvaId','uvaPid','checkerType','floatEps','timeLimitMs','memoryLimitKb']}}
        row={'slug':p['slug'],'spec':spec,'checks':[]}
        for kind in ('samples','testCases'):
            for c in p[kind]:
                check={'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output'])}
                try:check['status']='MATCH' if normalize(oracle(c['input']))==normalize(c['output']) else 'WRONG_EXPECTED_OUTPUT'
                except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
                row['checks'].append(check)
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
