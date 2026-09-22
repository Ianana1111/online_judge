#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    cout << "PERFECTION OUTPUT\n";
    int n;
    while (cin >> n && n != 0) {
        int total = n == 1 ? 0 : 1;
        for (int divisor = 2; divisor * divisor <= n; ++divisor) {
            if (n % divisor != 0) continue;
            total += divisor;
            int paired = n / divisor;
            if (paired != divisor) total += paired;
        }
        string kind = total == n ? "PERFECT" : total > n ? "ABUNDANT" : "DEFICIENT";
        cout << setw(5) << n << "  " << kind << '\n';
    }
    cout << "END OF OUTPUT\n";
}
