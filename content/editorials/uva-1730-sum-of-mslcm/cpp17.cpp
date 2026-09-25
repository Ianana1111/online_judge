#include <iomanip>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    long long n;
    while(cin >> n && n) {
        long long answer=0;
        for(long long left=1;left<=n;) {
            long long quotient=n/left,right=n/quotient;
            long long sum=(left+right)*(right-left+1)/2;
            answer+=sum*quotient;
            left=right+1;
        }
        cout << answer-1 << '\n';
    }
}
