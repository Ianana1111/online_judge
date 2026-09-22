#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; int answer = 6 * n;
        for (int a = 1; a * a * a <= n; ++a) if (n % a == 0)
            for (int b = a; b * b <= n / a; ++b) if ((n / a) % b == 0) {
                int c = n / a / b;
                answer = min(answer, 2 * (a * b + b * c + c * a));
            }
        cout << answer << '\n';
    }
}
