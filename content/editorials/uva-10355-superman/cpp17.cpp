#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);string city;
    while(cin>>city){
        array<long long,3> start,finish,direction;for(auto &x:start)cin>>x;for(auto &x:finish)cin>>x;
        long long a=0;for(int k=0;k<3;++k){direction[k]=finish[k]-start[k];a+=direction[k]*direction[k];}
        int n;cin>>n;long double fraction=0;
        for(int i=0;i<n;++i){
            array<long long,3> center;long long radius;for(auto &x:center)cin>>x;cin>>radius;
            long long b=0,c=-radius*radius;
            for(int k=0;k<3;++k){long long offset=start[k]-center[k];b+=offset*direction[k];c+=offset*offset;}
            long long discriminant=b*b-a*c;if(discriminant<=0)continue;
            long double root=sqrtl(discriminant),enter=(-b-root)/a,leave=(-b+root)/a;
            long double inside=max(0.0L,min(1.0L,leave)-max(0.0L,enter));
            fraction+=inside;
        }
        long double percentage=100*fraction;
        cout<<city<<'\n'<<fixed<<setprecision(2)<<percentage<<'\n';
    }
}
