#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    array<long long, 11> ways{}; ways[0] = 1;
    for (int pairs = 1; pairs <= 10; ++pairs)
        for (int inside = 0; inside < pairs; ++inside)
            ways[pairs] += ways[inside] * ways[pairs - 1 - inside];
    int n; bool first = true;
    while (cin >> n) {
        if (!first) cout << '\n'; first = false;
        cout << ways[n] << '\n';
    }
}
