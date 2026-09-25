#include <array>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    array<long long, 51> ways{}; ways[0] = ways[1] = 1;
    for (int n = 2; n <= 50; ++n) ways[n] = ways[n - 1] + ways[n - 2];
    int n; while (cin >> n && n) cout << ways[n] << '\n';
}
