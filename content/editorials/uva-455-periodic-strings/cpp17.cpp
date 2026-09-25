#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 0; tc < tests; ++tc) {
        string text; cin >> text; int n = text.size(), answer = n;
        for (int k = 1; k <= n; ++k) {
            if (n % k != 0) continue;
            bool good = true;
            for (int i = k; i < n; ++i) if (text[i] != text[i % k]) good = false;
            if (good) { answer = k; break; }
        }
        if (tc) cout << '\n';
        cout << answer << '\n';
    }
}
