"""Independent C++ references and focused wrong variants for the 16 missing GPE corpora.

Expected outputs are computed separately in author-gpe-recovery.py. These sources never read
those outputs. The manifests are generated artifacts consumed by the actual sandbox evaluator.
"""
HEADER = r'''#include <bits/stdc++.h>
using namespace std;
using ll = long long;
string decimal(unsigned __int128 n){if(!n)return "0";string s;while(n){s+=char('0'+n%10);n/=10;}reverse(s.begin(),s.end());return s;}
'''

SOURCES = {}
WRONG = {}
ALTERNATE = {}

def register(key, source, variants, alternate=None):
    SOURCES[key] = HEADER + source
    WRONG[key] = []
    for label, old, new in variants:
        assert source.count(old) == 1, (key, old, source.count(old))
        WRONG[key].append((label, HEADER + source.replace(old, new)))
    if alternate:
        old, new = alternate
        assert source.count(old) == 1
        ALTERNATE[key] = HEADER + source.replace(old, new)

register("2008-06", r'''
struct Parser{
 string s;size_t pos=0;
 void spaces(){while(pos<s.size()&&isspace((unsigned char)s[pos]))pos++;}
 int priority(char c){if(c=='+'||c=='-')return 1;if(c=='*'||c=='/')return 2;if(c=='%')return 3;return -1;}
 ll atom(){spaces();if(pos==s.size())throw 1;char c=s[pos];
  if(c=='+'||c=='-'){pos++;ll x=atom();return c=='-'?-x:x;}
  if(c=='('){pos++;ll x=expr(1);spaces();if(pos==s.size()||s[pos++]!=')')throw 1;return x;}
  if(!isdigit((unsigned char)c))throw 1;ll x=0;
  while(pos<s.size()&&isdigit((unsigned char)s[pos]))x=x*10+s[pos++]-'0';return x;}
 ll expr(int minimum){ll a=atom();while(true){spaces();if(pos==s.size())break;char op=s[pos];int p=priority(op);if(p<minimum)break;pos++;ll b=expr(p+1);
  if(op=='+')a+=b;else if(op=='-')a-=b;else if(op=='*')a*=b;
  else{if(!b)throw 1;if(op=='/')a=a/b;else a=a%b;}}return a;}
};
int main(){string line;int n=0;while(getline(cin,line)){cout<<"case "<<++n<<":\n";try{Parser p{line};ll x=p.expr(1);p.spaces();if(p.pos!=line.size())throw 1;cout<<x<<"\n\n";}catch(...){cout<<"syntactically incorrect\n\n";}}}
''', [
    ("Uses C precedence for remainder instead of the stated tighter precedence.", "if(c=='%')return 3", "if(c=='%')return 2"),
    ("Rounds negative quotients downward instead of truncating toward zero.", "a=a/b;", "a=a/b-((a%b!=0)&&((a<0)!=(b<0)));"),
])

register("2008-19", r'''
int main(){string line;bool first=true;while(getline(cin,line)){if(line==".")break;if(line.empty())continue;
 for(char &c:line)if(c=='{'||c=='}')c=' ';stringstream ss(line);vector<ll>a;ll x;while(ss>>x)a.push_back(x);sort(a.begin(),a.end());
 ll total=accumulate(a.begin(),a.end(),0LL);vector<vector<ll>>out;
 if(total%2==0){int k=a.size()/2,h=a.size()-k;map<ll,vector<int>>right;
  for(int mask=0;mask<(1<<h);mask++){ll sum=0;for(int j=0;j<h;j++)if(mask>>j&1)sum+=a[k+j];right[sum].push_back(mask);}
  for(int mask=0;mask<(1<<k);mask++){ll sum=0;for(int j=0;j<k;j++)if(mask>>j&1)sum+=a[j];auto it=right.find(total/2-sum);if(it==right.end())continue;
   for(int other:it->second){vector<ll>v;for(int j=0;j<k;j++)if(mask>>j&1)v.push_back(a[j]);for(int j=0;j<h;j++)if(other>>j&1)v.push_back(a[k+j]);out.push_back(v);}}}
 sort(out.begin(),out.end(),[](const auto&a,const auto&b){return a.size()!=b.size()?a.size()<b.size():a<b;});
 if(!first)cout<<"\n";first=false;if(out.empty())cout<<"No such subset\n";else{cout<<out.size()<<" subsets.\n";for(auto &v:out){cout<<"{";for(int i=0;i<(int)v.size();i++)cout<<(i?" ":"")<<v[i];cout<<"}\n";}}}}
''', [
    ("Counts only one side of each complementary partition.", "out.push_back(v);", "if(find(v.begin(),v.end(),a[0])!=v.end())out.push_back(v);"),
    ("Accepts subsets summing to floor(total/2) even when the total is odd.", "if(total%2==0)", "if(true)"),
])

register("2008-28", r'''
int main(){int t;cin>>t;while(t--){int n;cin>>n;vector<ll>a(n);for(ll &x:a)cin>>x;vector<vector<ll>>out;size_t best=0;
 for(int mask=1;mask<(1<<n);mask++){vector<ll>v;for(int i=0;i<n;i++)if(mask>>i&1)v.push_back(a[i]);bool ok=true;for(int i=1;i<(int)v.size();i++)if(v[i]<=v[i-1])ok=false;
  if(ok&&v.size()>=best){if(v.size()>best){out.clear();best=v.size();}out.push_back(v);}}
 sort(out.rbegin(),out.rend());cout<<out.size()<<"\n";for(auto &v:out){for(int i=0;i<(int)v.size();i++)cout<<(i?" ":"")<<v[i];cout<<"\n";}}}
''', [
    ("Prints LIS length where the required header is the number of maximal sequences.", 'cout<<out.size()<<"\\n";', 'cout<<best<<"\\n";'),
    ("Reports only one longest sequence, omitting other valid answers.", "sort(out.rbegin(),out.rend());", "sort(out.rbegin(),out.rend());out.resize(1);"),
], ("sort(out.rbegin(),out.rend());", "sort(out.begin(),out.end());"))

register("2008-37", r'''
ll parse(vector<string>&v,int &i){if(i==(int)v.size())throw 1;string s=v[i++];
 if(s.size()==1&&string("+-*/%").find(s[0])!=string::npos){ll a=parse(v,i),b=parse(v,i);char c=s[0];if(c=='+')return a+b;if(c=='-')return a-b;if(c=='*')return a*b;if(!b)throw 1;return c=='/'?a/b:a%b;}
 if(s.empty()||!all_of(s.begin(),s.end(),[](char c){return isdigit((unsigned char)c);}))throw 1;return stoll(s);}
int main(){string line;while(getline(cin,line)&&line!="."){stringstream ss(line);vector<string>v;string s;while(ss>>s)v.push_back(s);try{int i=0;ll x=parse(v,i);if(i!=(int)v.size())throw 1;cout<<x<<"\n";}catch(...){cout<<"illegal\n";}}}
''', [
    ("Ignores trailing tokens after an otherwise complete expression.", "if(i!=(int)v.size())throw 1;", ""),
    ("Reverses the operand order of subtraction.", "return a-b;", "return b-a;"),
])

register("2009-02", r'''
int main(){string s;vector<pair<ll,int>>e;while(getline(cin,s)&&s!="."){stringstream ss(s);ll a,b;if(ss>>a>>b){e.push_back({a,1});e.push_back({b,-1});}}
 sort(e.begin(),e.end());ll active=0,answer=0,previous=e.empty()?0:e[0].first;
 for(auto [position,delta]:e){answer+=(position-previous)*(active*(active-1)/2);active+=delta;previous=position;}
 cout<<answer<<"\n";}
''', [
    ("Computes union length instead of the sum of pairwise overlaps.", "(active*(active-1)/2)", "(active>0?1:0)"),
    ("Narrows the potentially 64-bit total to a 32-bit result.", 'cout<<answer<<"\\n";', 'cout<<static_cast<int>(answer)<<"\\n";'),
])

register("2009-17", r'''
string pre,in;
string post(int a,int l,int r){if(l==r)return "";char root=pre[a];int k=l;while(in[k]!=root)k++;string left=post(a+1,l,k),right=post(a+1+k-l,k+1,r);return left+right+root;}
int main(){int t;cin>>t;while(t--){int n;cin>>n;pre.clear();in.clear();char c;for(int i=0;i<n;i++){cin>>c;pre+=c;}for(int i=0;i<n;i++){cin>>c;in+=c;}string result=post(0,0,n);for(int i=0;i<n;i++)cout<<(i?" ":"")<<result[i];cout<<"\n";}}
''', [
    ("Emits preorder instead of postorder.", "return left+right+root;", "return root+left+right;"),
    ("Exchanges the left and right postorder traversals.", "return left+right+root;", "return right+left+root;"),
])

register("2009-24", r'''
int main(){int t;cin>>t;while(t--){int n;cin>>n;vector<pair<ll,ll>>p(n);for(auto &v:p)cin>>v.first>>v.second;set<tuple<ll,ll,ll>>lines;
 for(int i=0;i<n;i++)for(int j=0;j<i;j++){auto [x,y]=p[i];auto [u,v]=p[j];ll a=v-y,b=x-u,c=-(a*x+b*y);ll g=gcd(gcd(abs(a),abs(b)),abs(c));a/=g;b/=g;c/=g;
  if(a<0||(a==0&&b<0)){a=-a;b=-b;c=-c;}lines.insert({a,b,c});}
 cout<<lines.size()<<"\n";}}
''', [
    ("Merges distinct parallel lines by retaining only their direction.", "lines.insert({a,b,c});", "ll d=gcd(abs(a),abs(b));lines.insert({a/d,b/d,0});"),
    ("Fails to normalize proportional line equations.", "a/=g;b/=g;c/=g;", "(void)g;"),
])

register("2015-01", r'''
int main(){int m,n;if(!(cin>>m>>n))return 0;ll previous=0;for(int i=0;i<m;i++){ll current=0;for(int j=0;j<n-i;j++){ll x;cin>>x;current^=x;}if(i)cout<<(previous^current)<<"\n";previous=current;}}
''', [
    ("Compares every later list against the first list instead of its immediate predecessor.", "previous=current;", "if(i==0)previous=current;"),
    ("Collapses repeated numbers before comparing adjacent lists.", "current^=x;", "if(j==0||x!=last)current^=x;last=x;"),
])
# The second wrong variant needs a previous-value variable; the lists are intentionally unsorted.
WRONG["2015-01"][1] = (WRONG["2015-01"][1][0], WRONG["2015-01"][1][1].replace("ll current=0;", "ll current=0,last=LLONG_MIN;"))

register("2015-02", r'''
int main(){const ll mod=1000000009;unsigned long long n;while(cin>>n){ll a=3,b=4,ra=1,rb=0;unsigned long long k=n-1;
 while(k){if(k&1){rb=(a*rb+b)%mod;ra=a*ra%mod;}b=(a*b+b)%mod;a=a*a%mod;k>>=1;}cout<<(ra+rb)%mod<<"\n";}}
''', [
    ("Uses the more common 1e9+7 modulus instead of 1e9+9.", "mod=1000000009", "mod=1000000007"),
    ("Advances the recurrence one extra time.", "k=n-1;", "k=n;"),
])

register("2015-03", r'''
int a[81],rows[9],cols[9],boxes[9];
int box(int k){return (k/9/3)*3+(k%9/3);}
bool solve(){int at=-1,options=0,best=10;for(int k=0;k<81;k++)if(!a[k]){int mask=511&~(rows[k/9]|cols[k%9]|boxes[box(k)]);int count=__builtin_popcount((unsigned)mask);if(count<best){best=count;at=k;options=mask;}}
 if(at==-1)return true;while(options){int bit=options&-options;options-=bit;a[at]=__builtin_ctz((unsigned)bit)+1;rows[at/9]|=bit;cols[at%9]|=bit;boxes[box(at)]|=bit;
  if(solve())return true;rows[at/9]^=bit;cols[at%9]^=bit;boxes[box(at)]^=bit;a[at]=0;}return false;}
int main(){int t;cin>>t;while(t--){fill(rows,rows+9,0);fill(cols,cols+9,0);fill(boxes,boxes+9,0);bool valid=true;
 for(int k=0;k<81;k++){cin>>a[k];if(a[k]){int bit=1<<(a[k]-1);if((rows[k/9]|cols[k%9]|boxes[box(k)])&bit)valid=false;rows[k/9]|=bit;cols[k%9]|=bit;boxes[box(k)]|=bit;}}
 if(valid&&solve()){for(int k=0;k<81;k++)cout<<a[k]<<(k%9==8?"\n":" ");}else cout<<"NO\n";}}
''', [
    ("Accepts a completely filled board even when its givens conflict.", "valid=false;", "valid=true;"),
    ("Omits the 3x3-box rule when choosing digits.", "511&~(rows[k/9]|cols[k%9]|boxes[box(k)])", "511&~(rows[k/9]|cols[k%9])"),
], ("int bit=options&-options;", "int bit=1<<(31-__builtin_clz((unsigned)options));"))

register("2015-04", r'''
ll value(array<ll,3>a,int i){return (ll)((__int128)a[0]*i*i+(__int128)a[1]*i+a[2]);}
int main(){int t;cin>>t;while(t--){array<ll,3>a,b;for(ll &x:a)cin>>x;for(ll &x:b)cin>>x;int n;cin>>n;int k=n;int lo=max(0,k-n),hi=min(n,k);ll answer=0;
 while(lo<=hi){int take=(lo+hi)/2,other=k-take;ll al=take?value(a,take-1):LLONG_MIN,ar=take<n?value(a,take):LLONG_MAX,bl=other?value(b,other-1):LLONG_MIN,br=other<n?value(b,other):LLONG_MAX;
  if(al>br)hi=take-1;else if(bl>ar)lo=take+1;else{answer=max(al,bl);break;}}
 cout<<answer<<"\n";}}
''', [
    ("Selects rank N+1 instead of rank N.", "int k=n;", "int k=n+1;"),
    ("Truncates a valid 64-bit selected element to 32 bits.", 'cout<<answer<<"\\n";', 'cout<<static_cast<int>(answer)<<"\\n";'),
])

register("2015-07", r'''
int main(){int t;cin>>t;while(t--){int r,c;cin>>r>>c;vector<ll>d(c,LLONG_MAX/4);for(int i=0;i<r;i++)for(int j=0;j<c;j++){ll x;cin>>x;if(!i&&!j)d[j]=x;else d[j]=x+min(d[j],j?d[j-1]:LLONG_MAX/4);}cout<<d[c-1]<<"\n";}}
''', [
    ("Omits the starting cell from the path cost.", "d[j]=x;", "d[j]=0;"),
    ("Only follows the previous row, failing to account for cheaper routes from the left.", "min(d[j],j?d[j-1]:LLONG_MAX/4)", "(i?d[j]:d[j-1])"),
])

register("2015-08", r'''
int main(){int n;while(cin>>n){using Num=unsigned __int128;Num a=1,b=1;for(int i=1;i<n;i++){Num c=a+b;a=b;b=c;}cout<<decimal(b)<<"\n";}}
''', [
    ("Overflows the 64-bit counter for valid values up to n=100.", "using Num=unsigned __int128;", "using Num=unsigned long long;"),
    ("Counts Fibonacci(n) instead of Fibonacci(n+1).", "i<n;", "i<n-1;"),
])

register("2015-09", r'''
int main(){int n;while(cin>>n){vector<ll>tails;for(int i=0;i<n;i++){ll x;cin>>x;auto at=lower_bound(tails.begin(),tails.end(),x);if(at==tails.end())tails.push_back(x);else *at=x;}cout<<tails.size()<<"\n";}}
''', [
    ("Counts non-decreasing subsequences, allowing duplicate values to extend a sequence.", "lower_bound(tails.begin(),tails.end(),x)", "upper_bound(tails.begin(),tails.end(),x)"),
    ("Keeps only consecutive increasing runs rather than subsequences.", "auto at=lower_bound(tails.begin(),tails.end(),x);", "if(!tails.empty()&&x<=tails.back())tails.clear();auto at=lower_bound(tails.begin(),tails.end(),x);"),
])

register("22261", r'''
string trim(string s){size_t a=s.find_first_not_of(' ');if(a==string::npos)return "";return s.substr(a,s.find_last_not_of(' ')-a+1);}
vector<string>fields(string s){vector<string>v;size_t a=0;while(true){size_t b=s.find(',',a);v.push_back(trim(s.substr(a,b==string::npos?b:b-a)));if(b==string::npos)break;a=b+1;}return v;}
bool compareRows(const string&a,const string&b){return fields(a)<fields(b);}
int main(){string line;getline(cin,line);int n=stoi(line);vector<vector<string>>groups;vector<string>v;
 while(getline(cin,line)){if(!line.empty()&&line.back()=='\r')line.pop_back();if(line.empty()){if(!v.empty()){groups.push_back(v);v.clear();}}else v.push_back(line);}if(!v.empty())groups.push_back(v);
 for(int i=0;i<n;i++){auto rows=groups[i];stable_sort(rows.begin(),rows.end(),compareRows);if(i)cout<<"\n";for(const string&row:rows)cout<<row<<"\n";}}
''', [
    ("Sorts original row bytes, ignoring per-field whitespace and prefix ordering.", "return fields(a)<fields(b);", "return a<b;"),
    ("Trims output rows even though original spaces must be preserved.", 'cout<<row<<"\\n";', 'cout<<trim(row)<<"\\n";'),
], ("return fields(a)<fields(b);", "auto x=fields(a),y=fields(b);return x==y?a>b:x<y;"))

register("25081", r'''
int main(){vector<string>a(10);for(string&s:a)if(!(cin>>s))return 0;int start=-1,goal=-1;for(int i=0;i<100;i++){if(a[i/10][i%10]=='S')start=i;if(a[i/10][i%10]=='G')goal=i;}
 vector<int>parent(100,-1);queue<int>q;q.push(start);parent[start]=start;int dr[]={0,0,1,-1},dc[]={1,-1,0,0};
 while(!q.empty()){int p=q.front();q.pop();for(int d=0;d<4;d++){int r=p/10+dr[d],c=p%10+dc[d];if(r<0||r>=10||c<0||c>=10||a[r][c]=='#'||parent[r*10+c]!=-1)continue;parent[r*10+c]=p;q.push(r*10+c);}}
 if(parent[goal]==-1){cout<<"No solution\n\n";return 0;}
 for(int p=goal;;p=parent[p]){a[p/10][p%10]='+';if(p==start)break;}
 for(string&s:a)cout<<s<<"\n";cout<<"\n";}
''', [
    ("Marks every reachable dead end in addition to the solution path.", 'for(string&s:a)cout<<s<<"\\n";', 'for(int p=0;p<100;p++)if(parent[p]!=-1)a[p/10][p%10]=\'+\';for(string&s:a)cout<<s<<"\\n";'),
    ("Leaves the start and goal unmarked despite the specified sample format.", "a[p/10][p%10]='+';", "if(p!=start&&p!=goal)a[p/10][p%10]='+';"),
])
