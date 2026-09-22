#include <bits/stdc++.h>
using namespace std;
using Edge=pair<string,string>;
struct DSU {
    vector<int> p,size;
    explicit DSU(int n):p(n),size(n,1){iota(p.begin(),p.end(),0);}
    int find(int a){return p[a]==a?a:p[a]=find(p[a]);}
    void join(int a,int b){a=find(a);b=find(b);if(a==b)return;if(size[a]<size[b])swap(a,b);p[b]=a;size[a]+=size[b];}
};
vector<Edge> readMap() {
    vector<Edge> edges;string a,b,c;
    while(cin>>a) {
        if(a=="*"){cin>>b>>c;break;}
        cin>>b;edges.emplace_back(a,b);
    }
    return edges;
}
bool consistent(const vector<Edge>& oldEdges,const vector<Edge>& newEdges) {
    set<string> oldNodes,newNodes;
    for(auto [a,b]:oldEdges){oldNodes.insert(a);oldNodes.insert(b);}
    for(auto [a,b]:newEdges){newNodes.insert(a);newNodes.insert(b);}
    for(const string& v:oldNodes)if(!newNodes.count(v))return false;
    map<string,int> added;
    for(const string& v:newNodes)if(!oldNodes.count(v)){int id=added.size();added[v]=id;}
    DSU dsu(added.size());
    for(auto [a,b]:newEdges)if(added.count(a)&&added.count(b))dsu.join(added[a],added[b]);
    map<string,set<int>> attachments;set<Edge> direct;
    for(auto [a,b]:newEdges) {
        bool ao=oldNodes.count(a),bo=oldNodes.count(b);
        if(ao&&bo){if(a>b)swap(a,b);direct.emplace(a,b);}
        else if(ao)attachments[a].insert(dsu.find(added[b]));
        else if(bo)attachments[b].insert(dsu.find(added[a]));
    }
    for(auto [a,b]:oldEdges) {
        if(a==b)continue;
        if(a>b)swap(a,b);
        if(direct.count({a,b}))continue;
        const auto& left=attachments[a];const auto& right=attachments[b];
        auto i=left.begin(),j=right.begin();bool found=false;
        while(i!=left.end()&&j!=right.end()) {
            if(*i==*j){found=true;break;}
            if(*i<*j)++i;else ++j;
        }
        if(!found)return false;
    }
    return true;
}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    string oldName,newName;
    while(cin>>oldName&&oldName!="END") {
        auto oldEdges=readMap();cin>>newName;auto newEdges=readMap();
        bool good=consistent(oldEdges,newEdges);
        cout<<(good?"YES: ":"NO: ")<<newName<<" is "<<(good?"":"not ")<<"a more detailed version of "<<oldName<<'\n';
    }
}
