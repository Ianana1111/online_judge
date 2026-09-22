#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int lists, initialSize;
    if (!(cin >> lists >> initialSize)) return 0;
    long long previous = 0;
    for (int i = 0; i < lists; ++i) {
        long long current = 0;
        for (int j = 0; j < initialSize - i; ++j) {
            long long x;
            cin >> x;
            current ^= x;
        }
        if (i != 0) cout << (previous ^ current) << '\n';
        previous = current;
    }
}
