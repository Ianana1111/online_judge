#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    for(int tc=1;tc<=t;++tc) {
        int n,p,q;cin>>n>>p>>q;vector<int> position(n*n+1,-1),tails;
        for(int i=0;i<=p;++i){int value;cin>>value;position[value]=i;}
        for(int i=0;i<=q;++i) {
            int value;cin>>value;if(position[value]<0)continue;
            auto where=lower_bound(tails.begin(),tails.end(),position[value]);
            if(where==tails.end())tails.push_back(position[value]);else *where=position[value];
        }
        cout<<"Case "<<tc<<": "<<tails.size()<<'\n';
    }
}
