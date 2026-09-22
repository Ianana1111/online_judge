#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long low, high;
    while (cin >> low >> high && (low || high))
        cout << high / 5 - low / 5 + 1 << '\n';
}
