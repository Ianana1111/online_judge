#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, tc = 0;
    while (cin >> n && n) {
        vector<int> heights(n); int total = 0;
        for (int &h : heights) { cin >> h; total += h; }
        int target = total / n, moves = 0;
        for (int h : heights) moves += max(0, h - target);
        cout << "Set #" << ++tc << "\nThe minimum number of moves is " << moves << ".\n\n";
    }
}
