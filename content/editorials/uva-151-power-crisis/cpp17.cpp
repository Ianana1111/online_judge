#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        int step = 1;
        while (true) {
            int survivor = 0;
            for (int size = 2; size <= n - 1; ++size) survivor = (survivor + step) % size;
            if (survivor == 11) break;
            ++step;
        }
        cout << step << '\n';
    }
}
