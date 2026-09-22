#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int tests;cin>>tests;
    while(tests--){
        int n;cin>>n;vector<double> radius(n);for(auto &r:radius)cin>>r;sort(radius.begin(),radius.end());
        vector<vector<double>> gap(n,vector<double>(n));for(int i=0;i<n;++i)for(int j=0;j<n;++j)gap[i][j]=2*sqrt(radius[i]*radius[j]);
        double best=2*accumulate(radius.begin(),radius.end(),0.0);vector<int> order;vector<double> x;vector<bool> used(n,false);
        function<void(double)> search=[&](double width){
            if(width>=best)return;
            if((int)order.size()==n){best=width;return;}
            for(int i=0;i<n;++i){
                if(used[i]||(i>0&&radius[i]==radius[i-1]&&!used[i-1]))continue;
                double position=radius[i];
                for(int j=0;j<(int)order.size();++j)position=max(position,x[j]+gap[i][order[j]]);
                used[i]=true;order.push_back(i);x.push_back(position);
                search(max(width,position+radius[i]));
                x.pop_back();order.pop_back();used[i]=false;
            }
        };
        search(0);cout<<fixed<<setprecision(3)<<best<<'\n';
    }
}
