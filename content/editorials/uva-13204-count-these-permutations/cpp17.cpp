#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    const long long MOD=1000000007;
    vector<int> queries;int n,largest=0;
    while(cin >> n){queries.push_back(n);largest=max(largest,n/2);}
    vector<long long> factorial(largest+2,1);
    for(int i=1;i<=largest+1;++i)factorial[i]=factorial[i-1]*i%MOD;
    for(int n:queries) {
        long long f=factorial[n/2],answer=f*f%MOD;
        if(n%2)answer=answer*n%MOD;
        cout << answer << '\n';
    }
}
