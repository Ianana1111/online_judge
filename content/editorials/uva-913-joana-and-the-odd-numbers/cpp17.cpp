#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long n;
    while (cin >> n) {
        long long row = (n + 1) / 2;
        long long last = 2 * row * row - 1;
        cout << 3 * last - 6 << '\n';
    }
}
