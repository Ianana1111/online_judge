#include <iostream>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    while(t--){
        long long n,m;cin>>n>>m;
        long long answer=n*(2*m-n-1)/2;
        cout<<answer<<'\n';
    }
}
