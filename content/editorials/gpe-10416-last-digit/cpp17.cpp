#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    array<int, 100> prefix{};
    for (int i = 1; i < 100; ++i) {
        int term = 1;
        for (int e = 0; e < i; ++e) term = term * (i % 10) % 10;
        prefix[i] = (prefix[i - 1] + term) % 10;
    }
    string n;
    while (cin >> n) {
        if (n.find_first_not_of('0') == string::npos) break;
        int remainder = 0;
        for (char ch : n) remainder = (remainder * 10 + ch - '0') % 100;
        cout << prefix[remainder] << '\n';
    }
}
