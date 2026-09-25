#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<int> squares;
    for (int root = 1; root * root <= 100000; ++root) squares.push_back(root * root);
    int a, b;
    while (cin >> a >> b && (a != 0 || b != 0)) {
        auto first = lower_bound(squares.begin(), squares.end(), a);
        auto after = upper_bound(squares.begin(), squares.end(), b);
        cout << after - first << '\n';
    }
}
