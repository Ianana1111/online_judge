#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
struct Elephant{int weight,iq,id;};
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);vector<Elephant> animals;int w,s;
    while(cin>>w>>s)animals.push_back({w,s,(int)animals.size()+1});
    sort(animals.begin(),animals.end(),[](const auto &a,const auto &b){
        if(a.weight!=b.weight)return a.weight<b.weight;
        if(a.iq!=b.iq)return a.iq>b.iq;
        return a.id<b.id;
    });
    int n=animals.size(),last=-1;vector<int> length(n,1),previous(n,-1);
    for(int i=0;i<n;++i){
        for(int j=0;j<i;++j)if(animals[j].weight<animals[i].weight&&animals[j].iq>animals[i].iq){
            if(length[j]+1>length[i]){length[i]=length[j]+1;previous[i]=j;}
        }
        if(last<0||length[i]>length[last])last=i;
    }
    vector<int> answer;for(int i=last;i>=0;i=previous[i])answer.push_back(animals[i].id);
    reverse(answer.begin(),answer.end());cout<<answer.size()<<'\n';for(int id:answer)cout<<id<<'\n';
}
