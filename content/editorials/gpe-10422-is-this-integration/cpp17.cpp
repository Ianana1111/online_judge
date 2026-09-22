#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);long double a;
    const long double pi=acosl(-1.0L),root3=sqrtl(3.0L);
    while(cin>>a){
        long double square=a*a;
        long double striped=square*(1-root3+pi/3);
        long double dotted=square*(2*root3-4+pi/3);
        long double rest=square*(4-root3-2*pi/3);
        cout<<fixed<<setprecision(3)<<striped<<' '<<dotted<<' '<<rest<<'\n';
    }
}
