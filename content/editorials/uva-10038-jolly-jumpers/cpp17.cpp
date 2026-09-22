#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n) {
        vector<bool> seen(n, false); bool good = true;
        long long previous; cin >> previous;
        for (int i = 1; i < n; ++i) {
            long long current; cin >> current;
            long long difference = llabs(current - previous);
            if (difference < 1 || difference >= n || seen[difference]) good = false;
            else seen[difference] = true;
            previous = current;
        }
        cout << (good ? "Jolly" : "Not jolly") << '\n';
    }
}
