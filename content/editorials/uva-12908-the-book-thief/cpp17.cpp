#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long sum;
    while (cin >> sum && sum) {
        long long low = 1, high = 20000;
        while (low < high) {
            long long mid = (low + high) / 2;
            if (mid * (mid + 1) / 2 > sum) high = mid;
            else low = mid + 1;
        }
        long long pages = low, missing = pages * (pages + 1) / 2 - sum;
        cout << missing << ' ' << pages << '\n';
    }
}
