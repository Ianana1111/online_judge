#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int limit = 1000000; vector<long long> triangles(limit + 1);
    for (int largest = 3; largest <= limit; ++largest)
        triangles[largest] = triangles[largest - 1] + 1LL * (largest - 2) * (largest - 2) / 4;
    int n;
    while (cin >> n && n >= 3) cout << triangles[n] << '\n';
}
