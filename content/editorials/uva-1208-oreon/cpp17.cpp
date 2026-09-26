#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <numeric>
using namespace std;
string word(){string s;char c;while(cin.get(c)&&(c<=32||c==',')){}do{s+=c;}while(cin.get(c)&&c>32&&c!=',');return s;}
string normalize(string s){size_t first=s[0]=='+';while(first+1<s.size()&&s[first]=='0')first++;return s.substr(first);}
struct Edge{int a,b;string weight;};
int find(vector<int>&parent,int a){while(parent[a]!=a){parent[a]=parent[parent[a]];a=parent[a];}return a;}
int main(){
    int tests=stoi(word());
    for(int test=1;test<=tests;test++){
        int n=stoi(word());vector<Edge> edges;
        for(int a=0;a<n;a++)for(int b=0;b<n;b++){string w=normalize(word());if(a<b&&w!="0")edges.push_back({a,b,w});}
        sort(edges.begin(),edges.end(),[](const Edge&a,const Edge&b){
            if(a.weight.size()!=b.weight.size())return a.weight.size()<b.weight.size();
            if(a.weight!=b.weight)return a.weight<b.weight;if(a.a!=b.a)return a.a<b.a;return a.b<b.b;
        });
        vector<int> parent(n);iota(parent.begin(),parent.end(),0);cout<<"Case "<<test<<":\n";
        for(const Edge&e:edges){int a=find(parent,e.a),b=find(parent,e.b);if(a!=b){parent[a]=b;cout<<char('A'+e.a)<<'-'<<char('A'+e.b)<<' '<<e.weight<<'\n';}}
    }
}
