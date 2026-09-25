#include <algorithm>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    long long a,b;
    while(cin>>a>>b)cout<<max(a,b)-min(a,b)<<'\n';
}
