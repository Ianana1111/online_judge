"""Independent exhaustive vending transactions, Prim forest complements, and cipher parse DAGs."""
import argparse,collections,hashlib,heapq,itertools,json,random,string,subprocess
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
COKE='uva-10626-buying-coke';CYCLES='uva-11747-heavy-cycle-edges';CIPHER='uva-828-deciphering-messages'
def encrypt(key,shift,text):
 position=0;out=[]
 for ch in text:
  if ch==' ':out.append(ch);continue
  encoded=chr((ord(ch)-65+shift)%26+65)
  if ch in key:out.extend([key[position],encoded,key[(position+1)%len(key)]]);position=(position+1)%len(key)
  else:out.append(encoded)
 return ''.join(out)
def decipher(key,shift,message):
 size=len(message);states=[{} for _ in range(size+1)];states[0][0]=(1,None)
 def insert(at,position,count,parent):
  if position in states[at]:old,previous=states[at][position];states[at][position]=(min(2,old+count),previous)
  else:states[at][position]=(count,parent)
 inverse=lambda ch:chr((ord(ch)-65-shift)%26+65)
 for at in range(size):
  for position,(count,parent) in states[at].items():
   if message[at]==' ':insert(at+1,position,count,(at,position,' '));continue
   letter=inverse(message[at])
   if letter not in key:insert(at+1,position,count,(at,position,letter))
   if key and at+2<size and ' ' not in message[at:at+3] and message[at]==key[position] and message[at+2]==key[(position+1)%len(key)] and inverse(message[at+1]) in key:
    insert(at+3,(position+1)%len(key),count,(at,position,inverse(message[at+1])))
 total=sum(count for count,parent in states[size].values());assert total<=1
 if not total:return 'error in encryption'
 position=next(iter(states[size]));at=size;out=[]
 while at:
  count,parent=states[at][position];previous,old_position,ch=parent;out.append(ch);at,position=previous,old_position
 answer=''.join(reversed(out));assert encrypt(key,shift,answer)==message;return answer
def parse_cipher(data,strict=True):
 lines=data.splitlines();t=int(lines[0]);assert t>0;at=1;cases=[]
 for _ in range(t):
  while at<len(lines) and not lines[at].strip() and (at+1==len(lines) or not lines[at+1].strip().isdigit()):at+=1
  index=at;key=lines[at].strip();shift=int(lines[at+1]);count=int(lines[at+2]);at+=3;messages=lines[at:at+count];at+=count
  assert 1<=shift<=25 and count>=0 and len(messages)==count and set(key)<=set(string.ascii_uppercase)
  assert all(set(message)<=set(string.ascii_uppercase+' ') for message in messages)
  if strict:assert len(set(key))==len(key) and set(key).isdisjoint(chr((ord(ch)-65+shift)%26+65) for ch in key)
  cases.append((key,shift,messages,index))
 assert all(not line.strip() for line in lines[at:]);return cases
def ciphers(data):return '\n\n'.join('\n'.join(decipher(key,shift,message) for message in messages) for key,shift,messages,index in parse_cipher(data))+'\n'
def legal_key_subsequence(key,shift):
 n=len(key);adjacent=[0]*n
 for i,ch in enumerate(key):
  for j,other in enumerate(key):
   if (i!=j and ch==other) or (ord(ch)-ord(other))%26 in [shift,26-shift]:adjacent[i]|=1<<(n-1-j)
 @lru_cache(None)
 def solve(mask):
  if not mask:return 0
  position=mask.bit_length()-1;bit=1<<position;i=n-1-position
  use=bit|solve(mask&~bit&~adjacent[i]);skip=solve(mask&~bit)
  return max([use,skip],key=lambda m:(bin(m).count('1'),m))
 selected=solve((1<<n)-1);return ''.join(ch for i,ch in enumerate(key) if selected>>(n-1-i)&1)
def repair_keys(data):
 lines=data.splitlines(keepends=True);changed=0;removed=0
 for key,shift,messages,index in parse_cipher(data,strict=False):
  new=legal_key_subsequence(key,shift)
  if new!=key:
   ending='\r\n' if lines[index].endswith('\r\n') else '\n' if lines[index].endswith('\n') else '';lines[index]=new+ending;changed+=1;removed+=len(key)-len(new)
 return (''.join(lines),changed,removed) if changed else None

def heavy_edges(n,edges):
 adjacency=[[] for _ in range(n)]
 for index,(u,v,w) in enumerate(edges):adjacency[u].append((w,v,index));adjacency[v].append((w,u,index))
 seen=set();chosen=set()
 for start in range(n):
  if start in seen:continue
  queue=[(0,start,-1)]
  while queue:
   weight,u,index=heapq.heappop(queue)
   if u in seen:continue
   seen.add(u)
   if index>=0:chosen.add(index)
   for w,v,i in adjacency[u]:
    if v not in seen:heapq.heappush(queue,(w,v,i))
 return sorted(w for i,(u,v,w) in enumerate(edges) if i not in chosen)
def cycles(data):
 values=list(map(int,data.split()));at=0;out=[];done=False
 while at<len(values):
  n,m=values[at:at+2];at+=2
  if n==m==0:assert at==len(values);done=True;break
  assert 1<=n<=1000 and 0<=m<=25000;edges=[]
  for _ in range(m):
   u,v,w=values[at:at+3];at+=3;assert 0<=u<n and 0<=v<n and 0<=w<2**31;edges.append((u,v,w))
  assert len({w for u,v,w in edges})==m and len({tuple(sorted((u,v))) for u,v,w in edges})==m
  result=heavy_edges(n,edges);out.append(' '.join(map(str,result)) if result else 'forest')
 assert done;return '\n'.join(out)+'\n'
COKE_CPP=r'''
#include <algorithm>
#include <array>
#include <iostream>
#include <map>
#include <tuple>
#include <unordered_map>
#include <vector>
using namespace std;
int encode(int one,int five,int ten){return (one*151+five)*51+ten;}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    vector<array<int,6>> payments;
    for(int one=0;one<=17;++one)for(int five=0;five<=3;++five)for(int ten=0;ten<=1;++ten){
        int value=one+5*five+10*ten;
        if(value>=8&&value<=17)payments.push_back({one,five,ten,(value-8)%5,(value-8)/5,one+five+ten});
    }
    int cases;cin>>cases;map<array<int,4>,int> cache;
    while(cases--){
        int count,one,five,ten;cin>>count>>one>>five>>ten;array<int,4> key{count,one,five,ten};
        if(cache.count(key)){cout<<cache[key]<<'\n';continue;}
        unordered_map<int,int> states;states[encode(one,five,ten)]=0;
        for(int bought=0;bought<count;++bought){
            unordered_map<int,int> next;
            for(auto [encoded,cost]:states){
                int tens=encoded%51,fives=(encoded/51)%151,ones=encoded/51/151;
                for(auto p:payments)if(p[0]<=ones&&p[1]<=fives&&p[2]<=tens){
                    int destination=encode(ones-p[0]+p[3],fives-p[1]+p[4],tens-p[2]),candidate=cost+p[5];
                    auto found=next.find(destination);
                    if(found==next.end()||candidate<found->second)next[destination]=candidate;
                }
            }
            states.swap(next);
        }
        int best=1000000;for(auto [state,cost]:states)best=min(best,cost);cache[key]=best;cout<<best<<'\n';
    }
}
'''
def coke_binary():
 cache=ROOT/'generated/editorial-audit-20260921/oracle-binaries';cache.mkdir(exist_ok=True,parents=True,mode=0o700);digest=hashlib.sha256(COKE_CPP.encode()).hexdigest();source=cache/(digest+'.cpp');binary=cache/digest
 if not binary.exists():source.write_text(COKE_CPP);source.chmod(0o600);subprocess.run(['c++','-O2','-std=c++17',str(source),'-o',str(binary)],check=True,capture_output=True,text=True);binary.chmod(0o700)
 return binary
def cokes(data):
 values=list(map(int,data.split()));t=values[0];assert 1<=t<=50 and len(values)==4*t+1
 for i in range(t):
  count,one,five,ten=values[1+4*i:5+4*i];assert 1<=count<=150 and 0<=one<=500 and 0<=five<=100 and 0<=ten<=50 and one+5*five+10*ten>=8*count
 return subprocess.run([str(coke_binary())],input=data,text=True,capture_output=True,check=True,timeout=300).stdout
ORACLES={COKE:cokes,CYCLES:cycles,CIPHER:ciphers}
def format_cipher(cases):return str(len(cases))+'\n\n'+'\n\n'.join(key+'\n'+str(shift)+'\n'+str(len(messages))+'\n'+'\n'.join(messages) for key,shift,messages in cases)+'\n'
def additions():
 rng=random.Random(10626)
 wallets=[(1,8,0,0),(1,0,0,1),(2,0,4,0),(2,2,1,1),(2,1,4,1),(50,0,0,50),(150,500,100,50),(150,500,100,20)]
 while len(wallets)<50:
  count=rng.randint(1,15);one=rng.randint(0,60);five=rng.randint(0,20);ten=rng.randint(0,8)
  if one+five*5+ten*10>=8*count:wallets.append((count,one,five,ten))
 stress=[(150,500-i,100-i%3,50) for i in range(50)]
 graphs=[(1,[]),(4,[(0,1,0),(2,3,2**31-1)]),(3,[(0,1,0),(1,2,1),(0,2,2**31-1)])]
 for _ in range(25):
  n=rng.randint(2,15);pairs=list(itertools.combinations(range(n),2));rng.shuffle(pairs);pairs=pairs[:rng.randrange(len(pairs)+1)];weights=rng.sample(range(1000000),len(pairs));graphs.append((n,[(u,v,w) for (u,v),w in zip(pairs,weights)]))
 n=1000;pairs={(i,i+1) for i in range(n-1)}
 while len(pairs)<25000:
  u,v=sorted(rng.sample(range(n),2));pairs.add((u,v))
 pairs=sorted(pairs);weights=list(range(25000));rng.shuffle(weights);weights[0]=2**31-1;graphs.append((n,[(u,v,w) for (u,v),w in zip(pairs,weights)]))
 cases=[('A',1,['ACA','ABA','B','A','AA','ABA ACA ABA',encrypt('A',1,'A A B A'),'',encrypt('A',1,'AZB '*300)]),('',25,['ABC XYZ',''])]
 for key,shift in [('RSAEIO',2),('ACEGIKMOQSUWY',1),('Q',1),('AZ',13)]:
  assert set(key).isdisjoint(chr((ord(ch)-65+shift)%26+65) for ch in key);messages=[]
  for _ in range(30):
   text=' '.join(''.join(rng.choice(string.ascii_uppercase) for _ in range(rng.randint(1,30))) for _ in range(3));encrypted=encrypt(key,shift,text);messages.append(encrypted)
   at=rng.randrange(len(encrypted));messages.append(encrypted[:at]+rng.choice(string.ascii_uppercase)+encrypted[at+1:])
  cases.append((key,shift,messages))
 return {COKE:[str(len(rows))+'\n'+''.join(f'{c} {o} {f} {t}\n' for c,o,f,t in rows) for rows in [wallets,stress]],CYCLES:[''.join(f'{n} {len(edges)}\n'+''.join(f'{u} {v} {w}\n' for u,v,w in edges) for n,edges in graphs)+'0 0\n'],CIPHER:[format_cipher(cases)]}

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
    except (AssertionError,ValueError,IndexError,StopIteration):
     check['status']='INPUT_REQUIRES_REVIEW'
     if p['slug']==CIPHER:
      repaired=repair_keys(c['input'])
      if repaired:
       data,changed,removed=repaired;row['proposedReplacements'].append({'kind':kind,'ord':c['ord'],'inputHash':digest(c['input']),'outputHash':digest(c['output']),'input':data,'output':oracle(data),'reason':f'Repair {changed} invalid ordered alphabet keys by deleting the minimum total {removed} characters needed for distinctness and disjointness from their Caesar images; among equally long subsequences retain the earliest original positions. Keep every ciphertext message, shift, message count and all other input lines exactly unchanged. These keys violate the original uniqueness guarantee. Recompute all outputs via independent parse-DAG decoding plus exact forward encryption, rather than reusing answers from an ambiguous invalid key.'})
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'all feasible vending overpayments8..17,50largewallets;unique-weight25000-edge forests;literal-looking wrappers,middle membership,spaces and cipher round trips','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
