#include <algorithm>
#include <bitset>
#include <climits>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n,m;
    while (cin >> n >> m) {
        int k=min(n,m), total=0;
        vector<bitset<5001>> possible(k+1); possible[0][2500]=true;
        for (int i=0;i<n+m;++i) {
            int value; cin >> value; total+=value;
            for (int count=min(k,i+1);count>=1;--count) {
                if (value>=0) possible[count] |= possible[count-1] << value;
                else possible[count] |= possible[count-1] >> (-value);
            }
        }
        long long maximum=LLONG_MIN,minimum=LLONG_MAX;
        for (int sum=-2500;sum<=2500;++sum) if (possible[k][sum+2500]) {
            long long product=1LL*sum*(total-sum);
            maximum=max(maximum,product); minimum=min(minimum,product);
        }
        cout << maximum << ' ' << minimum << '\n';
    }
}
