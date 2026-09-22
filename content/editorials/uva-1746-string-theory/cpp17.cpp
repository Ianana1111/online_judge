#include <bits/stdc++.h>
using namespace std;
bool valid(vector<int> runs,int level){
    int quotes=accumulate(runs.begin(),runs.end(),0);
    if(quotes%2)return false;
    if(level==1)return quotes==2;
    int left=0,right=(int)runs.size()-1;
    for(int layer=level;layer>=2;--layer){
        while(left<=right&&runs[left]==0)++left;
        while(left<=right&&runs[right]==0)--right;
        if(left>right||runs[left]<layer||runs[right]<layer)return false;
        if(left==right&&runs[left]<2*layer)return false;
        runs[left]-=layer;runs[right]-=layer;quotes-=2*layer;
    }
    return quotes>=2;
}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n;
    while(cin>>n){
        vector<int> runs(n);for(int &x:runs)cin>>x;
        int total=accumulate(runs.begin(),runs.end(),0),answer=0;
        for(int k=min(runs.front(),runs.back());k>=1;--k){
            if(k*(k+1)<=total&&valid(runs,k)){answer=k;break;}
        }
        if(answer)cout<<answer<<'\n';else cout<<"no quotation\n";
    }
}
