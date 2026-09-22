"""Independent upper-prefix inclusion-exclusion with stars-and-bars digit transitions.
The complete compiled oracle source is embedded here so evidence binds its exact bytes.
"""
import argparse,hashlib,itertools,json,math,random,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
SLUG='gpe-10615-divisibility';MOD=1000000009
CPP=r'''
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
using ll=long long;
const ll MOD=1000000009;
ll choose[30][9];
ll prefixCount(const vector<ll>& upper,int prime){
    int n=upper.size(),states=1<<n;
    for(ll v:upper)if(v<0)return 0;
    vector<vector<int>> digits(n);int length=1;
    for(int i=0;i<n;++i){ll v=upper[i];do{digits[i].push_back(v%prime);v/=prime;}while(v);length=max(length,(int)digits[i].size());}
    for(auto &v:digits)v.resize(length);
    vector<ll> dp(states);dp[states-1]=1;
    vector<int> count(states);
    for(int mask=1;mask<states;++mask)count[mask]=count[mask>>1]+(mask&1);
    for(int pos=length-1;pos>=0;--pos){
        vector<ll> next(states);vector<int> sum(states);
        for(int mask=1;mask<states;++mask){int bit=__builtin_ctz((unsigned)mask);sum[mask]=sum[mask&(mask-1)]+digits[bit][pos];}
        for(int mask=0;mask<states;++mask)if(dp[mask]){
            for(int tight=mask;;tight=(tight-1)&mask){
                int budget=prime-1-sum[tight],freeCount=n-count[tight],released=mask^tight;
                if(budget>=0){
                    ll ways=0;
                    for(int subset=released;;subset=(subset-1)&released){
                        int remain=budget-sum[subset];
                        if(remain>=0)ways+=(count[subset]%2?-1:1)*choose[remain+freeCount][freeCount];
                        if(!subset)break;
                    }
                    next[tight]=(next[tight]+dp[mask]*ways)%MOD;
                }
                if(!tight)break;
            }
        }
        dp.swap(next);
    }
    ll answer=0;for(ll v:dp)answer=(answer+v)%MOD;return answer;
}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    choose[0][0]=1;
    for(int a=1;a<30;++a){choose[a][0]=1;for(int b=1;b<=8;++b)choose[a][b]=choose[a-1][b-1]+choose[a-1][b];}
    int t;cin>>t;
    for(int tc=1;tc<=t;++tc){
        int n,p;cin>>n>>p;vector<ll> lower(n),upper(n);for(ll &v:lower)cin>>v;for(ll &v:upper)cin>>v;
        ll answer=0;
        for(int mask=0;mask<(1<<n);++mask){
            vector<ll> bounds=upper;for(int i=0;i<n;++i)if(mask>>i&1)bounds[i]=lower[i]-1;
            ll value=prefixCount(bounds,p);
            answer=(answer+(__builtin_popcount((unsigned)mask)%2?MOD-value:value))%MOD;
        }
        cout<<"Case "<<tc<<": "<<answer<<'\n';
    }
}
'''
def read_cases(data):
 a=list(map(int,data.split()));t=a[0];assert 1<=t<=50;at=1;cases=[]
 for _ in range(t):
  n,p=a[at:at+2];at+=2;lower=a[at:at+n];at+=n;upper=a[at:at+n];at+=n
  assert 1<=n<=7 and p in [2,3,5,7,11,13,17,19] and len(lower)==len(upper)==n and all(0<=v<=w<=999999999999999 for v,w in zip(lower,upper));cases.append((n,p,lower,upper))
 assert at==len(a);return cases
def compile_oracle():
 cache=ROOT/'generated/editorial-audit-20260921/oracle-binaries';cache.mkdir(exist_ok=True,parents=True,mode=0o700)
 digest=hashlib.sha256(CPP.encode()).hexdigest();source=cache/(digest+'.cpp');binary=cache/digest
 if not binary.exists():
  source.write_text(CPP);source.chmod(0o600);subprocess.run(['c++','-O2','-std=c++17',str(source),'-o',str(binary)],check=True,capture_output=True,text=True);binary.chmod(0o700)
 return binary
def divisibility(data):
 read_cases(data);result=subprocess.run([str(compile_oracle())],input=data,text=True,capture_output=True,check=True,timeout=300);return result.stdout
def format_cases(cases):return str(len(cases))+'\n'+''.join(f'{n} {p}\n'+' '.join(map(str,lo))+'\n'+' '.join(map(str,hi))+'\n' for n,p,lo,hi in cases)
def factorial_valuation(n,p):
 answer=0
 while n:n//=p;answer+=n
 return answer
def brute_box(p,lower,upper):
 return sum(factorial_valuation(sum(x),p)==sum(factorial_valuation(v,p) for v in x) for x in itertools.product(*(range(a,b+1) for a,b in zip(lower,upper))))
ORACLES={SLUG:divisibility}
def additions():
 rng=random.Random(12581);small=[];large=[]
 for p in [2,3,5,7,11,13,17,19]:
  for n in [1,2,3,7]:
   lower=[rng.randrange(10**14,999999999999990) for _ in range(n)];upper=[x+rng.randrange(3) for x in lower];small.append((n,p,lower,upper))
   d=1
   while p**(d+1)<=10**15:d+=1
   large.append((n,p,[0]*n,[p**d-1]*n))
 for _ in range(18):
  p=rng.choice([2,3,5,7,19]);n=7;lo=[rng.randrange(10**12) for _ in range(n)];hi=[rng.randrange(10**14,10**15) for _ in range(n)];large.append((n,p,lo,hi))
 small.extend([(1,19,[0],[999999999999999]),(7,2,[0]*7,[0]*7),(7,19,[0]*7,[18]*7),(2,2,[1,1],[1,1]),(2,3,[1,1],[1,1])])
 mixed=[]
 for _ in range(50):
  n=rng.randint(1,7);p=rng.choice([2,3,5,7,19]);lo=[rng.randrange(8) for _ in range(n)];hi=[v+rng.randrange(10) for v in lo];mixed.append((n,p,lo,hi))
 return {SLUG:[format_cases(small),format_cases(large),format_cases(mixed)]}
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
    except (AssertionError,ValueError,IndexError,StopIteration):check['status']='INPUT_REQUIRES_REVIEW'
    row['checks'].append(check)
  for data in extra[p['slug']]:
   if not any(c['input']==data for c in p['testCases']):row['proposedAdditions'].append({'label':'prime-base zero/no-carry cells;15-digit narrow shifted boxes;complete digit cubes;50-case maximum-dimensional mixed-range stress','input':data,'output':oracle(data)})
  report['problems'].append(row)
 path=output/'oracle-report.json';path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');path.chmod(0o600);print(json.dumps([{'slug':p['slug'],'checked':len(p['checks']),'issues':[{'kind':c['kind'],'ord':c['ord'],'status':c['status']} for c in p['checks'] if c['status']!='MATCH']} for p in report['problems']]))
 if any(c['status']!='MATCH' for p in report['problems'] for c in p['checks']):raise SystemExit(1)
if __name__=='__main__':main()
