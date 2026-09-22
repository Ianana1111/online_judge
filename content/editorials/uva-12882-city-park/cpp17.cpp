#include <bits/stdc++.h>
using namespace std;
struct DSU {
    vector<int> parent,size;vector<long long> area;
    explicit DSU(int n):parent(n),size(n,1),area(n){iota(parent.begin(),parent.end(),0);}
    int find(int x){return parent[x]==x?x:parent[x]=find(parent[x]);}
    void join(int a,int b){a=find(a);b=find(b);if(a==b)return;if(size[a]<size[b])swap(a,b);parent[b]=a;size[a]+=size[b];area[a]+=area[b];}
};
struct Side {long long line,begin,end;int id;};
void connect(vector<Side>& sides,DSU& dsu) {
    sort(sides.begin(),sides.end(),[](const Side& a,const Side& b){return tie(a.line,a.begin,a.end,a.id)<tie(b.line,b.begin,b.end,b.id);});
    long long line=0,end=0;int representative=-1;
    for(const Side& side:sides) {
        if(representative>=0&&side.line==line&&side.begin<=end) {
            dsu.join(representative,side.id);
            if(side.end>end){end=side.end;representative=side.id;}
        } else {line=side.line;end=side.end;representative=side.id;}
    }
}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n;
    while(cin>>n) {
        DSU dsu(n);vector<Side> vertical,horizontal;vertical.reserve(2*n);horizontal.reserve(2*n);
        for(int i=0;i<n;++i) {
            long long x,y,w,h;cin>>x>>y>>w>>h;dsu.area[i]=w*h;
            vertical.push_back({x,y,y+h,i});vertical.push_back({x+w,y,y+h,i});
            horizontal.push_back({y,x,x+w,i});horizontal.push_back({y+h,x,x+w,i});
        }
        connect(vertical,dsu);connect(horizontal,dsu);
        long long answer=0;for(int i=0;i<n;++i)answer=max(answer,dsu.area[dsu.find(i)]);
        cout<<answer<<'\n';
    }
}
