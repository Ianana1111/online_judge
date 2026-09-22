#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    array<long long,31> safe{}; safe[0] = 1; safe[1] = 2; safe[2] = 4;
    for (int length = 3; length <= 30; ++length) safe[length] = safe[length-1] + safe[length-2] + safe[length-3];
    int n;
    while (cin >> n && n) cout << (1LL << n) - safe[n] << '\n';
}
