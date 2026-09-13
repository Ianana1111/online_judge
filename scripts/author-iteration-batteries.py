"""Deterministic authored references/mutations and independent Python regression oracles.

The reference programs are reviewed from the stored statements. No production database writes.
Run against the private audit-project-data snapshot, then run audit-judge-batteries.ts.
"""
import itertools
import json
import math
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
snapshot = json.loads(Path(sys.argv[1]).read_text())
problems = {p["slug"]: p for p in snapshot["problems"]}
cases, corrections = [], []
slugs = []
header = '#include <bits/stdc++.h>\nusing namespace std;\n'

def manifest(slug, source, mutations):
    slugs.append(slug)
    candidates = [{"tag": "correct", "label": "Independent reference implementing the stored statement; adversarial outputs also computed by the Python oracle in author-iteration-batteries.py.", "languageKey": "cpp17", "sourceCode": header + source}]
    for tag, label, old, new in mutations:
        assert old in source
        candidates.append({"tag": tag, "label": label, "languageKey": "cpp17", "sourceCode": header + source.replace(old, new)})
    path = root / "packages/db/audit/battery-manifests" / (slug + ".json")
    path.write_text(json.dumps({"slug": slug, "uvaId": problems[slug]["uvaId"], "authoredAt": "2026-09-13T12:00:00.000Z", "candidates": candidates}, indent=2) + "\n")

def regression(slug, input_text, output, reason):
    cases.append({"slug": slug, "input": input_text, "output": output, "reason": reason})

slug = 'gpe-10416-last-digit'
manifest(slug, r'''int main(){int sums[100]={};for(int n=1;n<100;n++){int x=1;for(int j=0;j<n;j++)x=x*n%10;sums[n]=(sums[n-1]+x)%10;}string s;while(cin>>s&&s!="0"){int r=0;for(char c:s)r=(r*10+c-'0')%100;cout<<sums[r]<<"\n";}}
''', [('custom','Incorrectly assumes the prefix sum repeats every 20, ignoring the cycle sum of 4.','%100','%20'),('off-by-one','Omits the final term N^N.','sums[r]','sums[(r+99)%100]')])
values = list(range(1, 401)) + [10**100, 2*10**100, 10**100+97]
prefix = [0]
for n in range(1, 101): prefix.append((prefix[-1] + pow(n,n,10)) % 10)
assert prefix[20] == 4 and prefix[100] == 0
# Independent direct modular exponentiation for all bounded N; periodic proof for 101-digit N.
out = [sum(pow(k,k,10) for k in range(1,n+1)) % 10 if n <= 400 else prefix[n%100] for n in values]
regression(slug, '\n'.join(map(str, values))+'\n0\n', '\n'.join(map(str,out))+'\n', 'Every remainder, complete cycles and maximum-length input.')

slug = 'gpe-10468-maximum-product'
source = r'''int main(){int n,c=0;while(cin>>n){vector<long long>a(n);for(auto &v:a)cin>>v;long long best=0;for(int i=0;i<n;i++){long long p=1;for(int j=i;j<n;j++){p*=a[j];best=max(best,p);}}cout<<"Case #"<<++c<<": The maximum product is "<<best<<".\n\n";}}
'''
manifest(slug, source, [('overflow','Uses 32-bit products; valid length-18 products reach 10^18.','long long','int'),('custom','Only considers prefixes, missing the best subarray after a zero or negative prefix.','i<n','i<1')])
def product_output(groups):
    result=[]
    for i,a in enumerate(groups,1):
        result.append(f'Case #{i}: The maximum product is {max([0]+[math.prod(a[l:r]) for l in range(len(a)) for r in range(l+1,len(a)+1)])}.')
    return '\n\n'.join(result)+'\n'
groups = [list(a) for n in range(1,6) for a in itertools.product([-2,0,2],repeat=n)] + [[10]*18,[-10]*18,[-7],[0,2,3,0,-2,-4]]
regression(slug,''.join(str(len(a))+'\n'+' '.join(map(str,a))+'\n' for a in groups),product_output(groups),'Exhaustive small arrays, zero partitions, all-negative and 64-bit limits.')
for tc in problems[slug]['testCases']:
    tokens=iter(map(int,tc['input'].split())); parsed=[]
    for n in tokens: parsed.append([next(tokens) for _ in range(n)])
    expected=product_output(parsed)
    # Preserve every numeric answer; only add the blank dataset separators required by the statement.
    assert tc['output'].split() == expected.split(), 'Numeric mismatch requires independent review'
    if tc['output'].rstrip() != expected.rstrip(): corrections.append({'slug':slug,'input':tc['input'],'previousOutput':tc['output'],'output':expected,'reason':'The statement explicitly requires a blank line after each dataset; numeric answers independently reconfirmed.'})

slug = 'gpe-10500-brick-wall-patterns'
manifest(slug,r'''int main(){long long f[51]={1,1};for(int i=2;i<=50;i++)f[i]=f[i-1]+f[i-2];int n;while(cin>>n&&n)cout<<f[n]<<"\n";}
''',[('overflow','32-bit recurrence overflows for valid wall widths.','long long','int'),('off-by-one','Returns F(n), not F(n+1).','cout<<f[n]','cout<<f[n-1]')])
regression(slug,'\n'.join(map(str,range(1,51)))+'\n0\n',''.join(str(sum(math.comb(n-k,k) for k in range(n//2+1)))+'\n' for n in range(1,51)),'Every legal width, independently counted by choosing horizontal brick pairs.')

slug = 'gpe-10501-safe-salutations'
manifest(slug,r'''int main(){long long c[11]={1};for(int n=1;n<=10;n++)for(int i=0;i<n;i++)c[n]+=c[i]*c[n-1-i];int n;bool first=true;while(cin>>n){if(!first)cout<<"\n";first=false;cout<<c[n]<<"\n";}}
''',[('custom','Counts only one split direction, missing most noncrossing matchings.','i<n','i<1'),('off-by-one','Uses the Catalan number for one fewer pair.','cout<<c[n]','cout<<c[n-1]')])
regression(slug,'\n\n'.join(map(str,range(1,11)))+'\n','\n\n'.join(str(math.comb(2*n,n)//(n+1)) for n in range(1,11))+'\n','Every legal pair count, recurrence checked against the closed Catalan formula.')

slug = 'gpe-10520-conformity'
manifest(slug,r'''int main(){int n;while(cin>>n&&n){map<array<int,5>,int>m;int mx=0;for(int i=0;i<n;i++){array<int,5>a;for(int &x:a)cin>>x;sort(a.begin(),a.end());mx=max(mx,++m[a]);}int answer=0;for(auto [a,count]:m)if(count==mx)answer+=count;cout<<answer<<"\n";}}
''',[('custom','Treats different orderings of the same five courses as different combinations.','sort(a.begin(),a.end());',''),('custom','Returns the frequency of a single winner and ignores tied combinations.','cout<<answer','cout<<mx')])
groups = [[list(p) for p in itertools.permutations(range(100,105))],[[100,101,102,103,104],[100,101,102,103,105]],[[100,101,102,103,104]]*2+[[101,102,103,104,105]]*2+[[102,103,104,105,106]]]
from collections import Counter
outputs=[]
for group in groups:
    counts=Counter(frozenset(a) for a in group); outputs.append(sum(c for c in counts.values() if c==max(counts.values())))
regression(slug,''.join(str(len(g))+'\n'+''.join(' '.join(map(str,a))+'\n' for a in g) for g in groups)+'0\n',''.join(str(n)+'\n' for n in outputs),'Permutation invariance, all-unique and tied most-popular combinations.')

slug = 'gpe-10603-cutting-sticks'
manifest(slug,r'''int main(){int l,n;while(cin>>l&&l){cin>>n;vector<int>a(n+2);a[n+1]=l;for(int i=1;i<=n;i++)cin>>a[i];vector<vector<int>>d(n+2,vector<int>(n+2));for(int gap=2;gap<n+2;gap++)for(int i=0;i+gap<n+2;i++){int j=i+gap;d[i][j]=INT_MAX;for(int k=i+1;k<j;k++)d[i][j]=min(d[i][j],d[i][k]+d[k][j]+a[j]-a[i]);}cout<<"The minimum cutting is "<<d[0][n+1]<<".\n";}}
''',[('custom','Always takes the leftmost remaining cut instead of optimizing the order.','k<j','k<i+2'),('custom','Charges the number of segments rather than stick length.','+a[j]-a[i]','+j-i')])
groups=[(l,cut) for l in range(2,10) for n in range(min(4,l)) for cut in itertools.combinations(range(1,l),n)]
def exhaustive_cut(l,cuts):
    costs=[]
    for order in itertools.permutations(cuts):
        bounds=[0,l];cost=0
        for cut in order:
            cost+=min(x for x in bounds if x>cut)-max(x for x in bounds if x<cut);bounds.append(cut)
        costs.append(cost)
    return min(costs)
regression(slug,''.join(f'{l}\n{len(cuts)}\n'+ ' '.join(map(str,cuts))+'\n' for l,cuts in groups)+'0\n',''.join(f'The minimum cutting is {exhaustive_cut(l,cuts)}.\n' for l,cuts in groups),'Independent exhaustive cut-order enumeration, including zero cuts and uneven segments.')
(root/'packages/db/audit/iteration-regressions.json').write_text(json.dumps({'cases':cases,'corrections':corrections},indent=2)+'\n')
print(json.dumps({'slugs':slugs,'newManifests':len(slugs),'candidates':len(slugs)*3,'regressions':len(cases),'formatCorrections':len(corrections)}))
