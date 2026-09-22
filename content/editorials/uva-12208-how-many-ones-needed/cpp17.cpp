#include <bits/stdc++.h>
using namespace std;
long long prefix(long long n) {
    if (n<0) return 0;
    long long total=0;
    for (long long bit=1;bit<=n;bit*=2) {
        long long count=n+1,period=bit*2;
        total+=(count/period)*bit;
        total+=max(0LL,count%period-bit);
    }
    return total;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long left,right; int tc=0;
    while (cin >> left >> right && (left || right)) {
        cout << "Case " << ++tc << ": " << prefix(right)-prefix(left-1) << '\n';
    }
}
