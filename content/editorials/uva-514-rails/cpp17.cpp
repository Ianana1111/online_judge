#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        int first;
        while (cin >> first && first) {
            vector<int> target(n); target[0] = first;
            for (int i = 1; i < n; ++i) cin >> target[i];
            vector<int> station; int next = 1; bool possible = true;
            for (int wanted : target) {
                while (next <= n && (station.empty() || station.back() != wanted)) station.push_back(next++);
                if (station.empty() || station.back() != wanted) { possible = false; break; }
                station.pop_back();
            }
            cout << (possible ? "Yes" : "No") << '\n';
        }
        cout << '\n';
    }
}
