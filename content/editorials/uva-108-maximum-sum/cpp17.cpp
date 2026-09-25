#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        vector<vector<int>> a(n, vector<int>(n)); for (auto &row : a) for (int &x : row) cin >> x;
        int answer = INT_MIN;
        for (int top = 0; top < n; ++top) {
            vector<int> columns(n, 0);
            for (int bottom = top; bottom < n; ++bottom) {
                for (int c = 0; c < n; ++c) columns[c] += a[bottom][c];
                int ending = columns[0]; answer = max(answer, ending);
                for (int c = 1; c < n; ++c) {
                    ending = max(columns[c], ending + columns[c]);
                    answer = max(answer, ending);
                }
            }
        }
        cout << answer << '\n';
    }
}
