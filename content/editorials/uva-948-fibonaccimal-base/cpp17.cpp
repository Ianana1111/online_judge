#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<int> fib{1,2};
    while (fib.back() < 100000000) fib.push_back(fib.back() + fib[fib.size() - 2]);
    int tests; cin >> tests;
    while (tests--) {
        int original; cin >> original; int remaining = original; string digits; bool started = false;
        for (int i = (int)fib.size() - 1; i >= 0; --i) {
            if (fib[i] <= remaining) { digits += '1'; remaining -= fib[i]; started = true; }
            else if (started) digits += '0';
        }
        cout << original << " = " << digits << " (fib)\n";
    }
}
