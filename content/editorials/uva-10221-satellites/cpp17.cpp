#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);long long height,angle;string unit;
    const long double pi=acosl(-1.0L);
    while(cin>>height>>angle>>unit){
        long double degrees=angle;
        if(unit=="min")degrees/=60.0L;
        degrees=fmodl(degrees,360.0L);
        if(degrees>180)degrees=360-degrees;
        long double radius=6440.0L+height,theta=degrees*pi/180;
        long double arc=radius*theta,chord=2*radius*sinl(theta/2);
        cout<<fixed<<setprecision(6)<<arc<<' '<<chord<<'\n';
    }
}
