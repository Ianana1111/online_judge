#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<int> sum(1001, 0), largest(1001, -1);
    for (int divisor = 1; divisor <= 1000; ++divisor)
        for (int multiple = divisor; multiple <= 1000; multiple += divisor) sum[multiple] += divisor;
    for (int n = 1; n <= 1000; ++n) if (sum[n] <= 1000) largest[sum[n]] = n;
    int s, tc = 0;
    while (cin >> s && s != 0) cout << "Case " << ++tc << ": " << largest[s] << '\n';
}
