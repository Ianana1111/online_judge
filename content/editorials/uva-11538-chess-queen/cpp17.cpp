#include <algorithm>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long m, n;
    while (cin >> m >> n && (m || n)) {
        if (m > n) swap(m,n);
        long long straight = m * n * (m + n - 2);
        long long diagonal = 4 * m * (m - 1) * (m - 2) / 3 + 2 * (n - m + 1) * m * (m - 1);
        cout << straight + diagonal << '\n';
    }
}
