"""Generating-denominator recurrence, exhaustive word ranks, all-pairs paths and literal queues."""
import argparse,hashlib,json,random,itertools
from collections import deque
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
@lru_cache(None)
def coin_coefficients():
 # After accounting for pennies, use units of five cents and the rational denominator.
 denominator=[1]
 for exponent in [1,1,2,5,10]:
  result=denominator+[0]*exponent
  for i,value in enumerate(denominator):result[i+exponent]-=value
  denominator=result
 coefficients=[0]*6001;coefficients[0]=1
 for i in range(1,6001):coefficients[i]=-sum(denominator[j]*coefficients[i-j] for j in range(1,min(i,len(denominator)-1)+1))
 return coefficients

def coins(data,verbose=False):
 amounts=list(map(int,data.split()));assert all(0<=a<=(30000 if verbose else 7489) for a in amounts);out=[]
 for amount in amounts:
  ways=coin_coefficients()[amount//5]
  if verbose:out.append(f'There are {ways} ways to produce {amount} cents change.' if ways!=1 else f'There is only 1 way to produce {amount} cents change.')
  else:out.append(str(ways))
 return '\n'.join(out)+'\n'
def manyways(data):return coins(data,True)

@lru_cache(None)
def word_indices():
 words=[''.join(chars) for size in range(1,6) for chars in itertools.combinations('abcdefghijklmnopqrstuvwxyz',size)];assert len(words)==83681;return {word:i+1 for i,word in enumerate(words)}
def words(data):
 values=data.split();assert all(1<=len(v)<=5 and set(v)<=set('abcdefghijklmnopqrstuvwxyz') for v in values);ranks=word_indices();return ''.join(str(ranks.get(v,0))+'\n' for v in values)

@lru_cache(None)
def knight_distances():
 distance=[[0 if i==j else 1000 for j in range(64)] for i in range(64)]
 for a in range(64):
  for b in range(64):
   if sorted([abs(a//8-b//8),abs(a%8-b%8)])==[1,2]:distance[a][b]=1
 for k in range(64):
  for i in range(64):
   for j in range(64):distance[i][j]=min(distance[i][j],distance[i][k]+distance[k][j])
 return distance

def knights(data):
 a=data.split();assert len(a)%2==0 and all(len(x)==2 and x[0] in 'abcdefgh' and x[1] in '12345678' for x in a);index=lambda s:(ord(s[0])-97)*8+int(s[1])-1;return ''.join(f'To get from {x} to {y} takes {knight_distances()[index(x)][index(y)]} knight moves.\n' for x,y in zip(a[::2],a[1::2]))

def leaf(depth,number):return (1<<(depth-1))+int(f'{number-1:0{depth-1}b}'[::-1],2)
def balls(data):
 a=list(map(int,data.split()));t=a[0];assert t>=0 and len(a)==2*t+2 and a[-1]==-1;out=[]
 for d,i in zip(a[1:-1:2],a[2:-1:2]):assert 2<=d<=20 and 1<=i<=1<<(d-1);out.append(str(leaf(d,i)))
 return '\n'.join(out)+'\n'

def literal_queue(teams,commands):
 owner={v:i for i,team in enumerate(teams) for v in team};line=[];answer=[]
 for command in commands:
  if command is None:assert line;answer.append(line.pop(0))
  else:
   target=owner[command];position=len(line)
   for i in range(len(line)-1,-1,-1):
    if owner[line[i]]==target:position=i+1;break
   line.insert(position,command)
 return answer

def teamqueues(data):
 tokens=data.split();i=0;out=[];ended=False;case=0
 while i<len(tokens):
  t=int(tokens[i]);i+=1
  if t==0:assert i==len(tokens);ended=True;break
  assert 1<=t<=1000;teams=[];members=set()
  for _ in range(t):
   size=int(tokens[i]);i+=1;assert 1<=size<=1000;team=list(map(int,tokens[i:i+size]));i+=size;assert len(team)==size and len(set(team))==size and all(0<=v<=999999 and v not in members for v in team);members.update(team);teams.append(team)
  commands=[]
  while tokens[i]!='STOP':
   word=tokens[i];i+=1
   if word=='DEQUEUE':commands.append(None)
   else:assert word=='ENQUEUE';value=int(tokens[i]);i+=1;assert value in members;commands.append(value)
  i+=1;assert len(commands)+1<=200000;case+=1;result=literal_queue(teams,commands);out.append(f'Scenario #{case}\n'+''.join(f'{v}\n' for v in result))
 assert ended;return '\n'.join(out)+'\n'

def expression_cost(expression,dimensions):
 # Find subtree intervals first, then evaluate the syntax tree in explicit postorder.
 matching={};stack=[]
 for i,ch in enumerate(expression):
  if ch=='(':stack.append(i)
  elif ch==')':assert stack;start=stack.pop();matching[start]=i
  else:assert ch in dimensions
 assert not stack
 results={};pending=[(0,len(expression)-1,False)]
 while pending:
  left,right,done=pending.pop()
  if left==right:assert expression[left] in dimensions;results[left]=(dimensions[expression[left]],0);continue
  assert expression[left]=='(' and matching[left]==right
  first=left+1;first_end=matching[first] if expression[first]=='(' else first;second=first_end+1;assert second<right
  if not done:pending += [(left,right,True),(second,right-1,False),(first,first_end,False)];continue
  a,acost=results[first];b,bcost=results[second]
  if a is None or b is None or a[1]!=b[0]:results[left]=(None,0)
  else:results[left]=((a[0],b[1]),acost+bcost+a[0]*a[1]*b[1])
 dimensions,cost=results[0];return 'error' if dimensions is None else str(cost)

def matrices(data):
 lines=data.splitlines();n=int(lines[0]);assert 1<=n<=26;dimensions={}
 for line in lines[1:n+1]:
  name,r,c=line.split();r,c=int(r),int(c);assert len(name)==1 and 'A'<=name<='Z' and name not in dimensions and r>0 and c>0;dimensions[name]=(r,c)
 expressions=lines[n+1:];assert all(s and not any(c.isspace() for c in s) for s in expressions);return ''.join(expression_cost(s,dimensions)+'\n' for s in expressions)
ORACLES={'uva-357-let-me-count-the-ways':manyways,'uva-674-coin-change':coins,'uva-417-word-index':words,'uva-439-knight-moves':knights,'uva-540-team-queue':teamqueues,'uva-679-dropping-balls':balls,'uva-442-matrix-chain-multiplication':matrices}
def repair_input(slug,data):
 if slug!='uva-442-matrix-chain-multiplication':return None
 lines=data.splitlines();n=int(lines[0]);header=lines[:n+1];body=lines[n+1:]
 if not any(not line.strip() for line in body):return None
 return '\n'.join(header+[line for line in body if line.strip()])+'\n'

def additions():
 rng=random.Random(540);allwords=list(word_indices());invalid=['aa','ba','cat','zzzzz','zyxwv','abca']+[''.join(rng.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(rng.randrange(1,6))) for _ in range(500)];rng.shuffle(invalid)
 squares=[a+b for a in 'abcdefgh' for b in '12345678'];journeys=[(a,b) for a in squares for b in squares]
 drops=[(d,i) for d in range(2,13) for i in range(1,(1<<(d-1))+1)]+[(d,1) for d in range(2,21)]+[(d,1<<(d-1)) for d in range(2,21)]+[(20,rng.randrange(1,524289)) for _ in range(5000)]
 scenarios=[([[0,1],[999999,999998]],[0,999999,1,None,None,0,999998,None,None,None])]
 # Exactly 200000 commands including STOP; no element is enqueued while already present.
 commands=[]
 for i in range(99999):commands.extend([i%1000,None])
 commands.append(999);scenarios.append(([[i] for i in range(1000)],commands))
 scenarios.append(([list(range(1000)),list(range(1000,2000))],list(range(2000))+[None]*2000))
 for _ in range(15):
  teams=[list(range(10*i,10*i+10)) for i in range(5)];available=set(range(50));active=[];commands=[]
  for _ in range(300):
   if active and (not available or rng.random()<.45):
    # Maintain a literal queue solely to ensure a popped member becomes available again.
    commands.append(None);value=active.pop(0);available.add(value)
   else:
    value=rng.choice(sorted(available));available.remove(value);team=value//10;position=len(active)
    for j in range(len(active)-1,-1,-1):
     if active[j]//10==team:position=j+1;break
    active.insert(position,value);commands.append(value)
  scenarios.append((teams,commands))
 queue_input=''
 for teams,commands in scenarios:queue_input+=str(len(teams))+'\n'+''.join(str(len(team))+' '+' '.join(map(str,team))+'\n' for team in teams)+''.join('DEQUEUE\n' if c is None else f'ENQUEUE {c}\n' for c in commands)+'STOP\n'
 dims={'A':(2,3),'B':(3,4),'C':(4,5),'D':(5,2),'E':(2,2),'F':(50000,50000),'G':(1,1)}
 expressions=['A','(AB)','(BA)','(A(BC))','((AB)C)','((AB)(CD))','((AC)B)','(FF)','(GG)']
 for _ in range(100):
  parts=[rng.choice(list(dims)) for _ in range(rng.randrange(1,30))]
  while len(parts)>1:
   at=rng.randrange(len(parts)-1);parts[at:at+2]=['('+parts[at]+parts[at+1]+')']
  expressions+=parts
 expressions+=['('*2000+'G'+'G)'*2000]
 return {'uva-357-let-me-count-the-ways':'\n'.join(map(str,range(30001)))+'\n','uva-674-coin-change':'\n'.join(map(str,range(7490)))+'\n','uva-417-word-index':'\n'.join(allwords+invalid)+'\n','uva-439-knight-moves':''.join(f'{a} {b}\n' for a,b in journeys),'uva-540-team-queue':queue_input+'0\n','uva-679-dropping-balls':str(len(drops))+'\n'+''.join(f'{d} {i}\n' for d,i in drops)+'-1\n','uva-442-matrix-chain-multiplication':str(len(dims))+'\n'+''.join(f'{name} {r} {c}\n' for name,(r,c) in dims.items())+'\n'.join(expressions)+'\n'}

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
                except (AssertionError,ValueError,IndexError,StopIteration):
                    check['status']='INPUT_REQUIRES_REVIEW';corrected=repair_input(p['slug'],c['input'])
                    if corrected is not None:row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':corrected,'output':oracle(corrected),'reason':'Remove only empty lines in the expression section: the grammar requires one nonempty expression per line. Matrix definitions, all expressions and all numeric results are preserved.'})
                row['checks'].append(check)
        data=extra[p['slug']]
        if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'complete coin amount domains, every valid word, every knight square pair, maximum command count, returning teams, bit reversal boundaries and deep matrix expressions','input':data,'output':oracle(data)})
        report['problems'].append(row)
    path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600)
    print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
    if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)

if __name__=='__main__':main()
