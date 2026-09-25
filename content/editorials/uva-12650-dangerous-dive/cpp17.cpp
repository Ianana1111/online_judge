#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, returned;
    while (cin >> n >> returned) {
        vector<bool> present(n + 1, false);
        for (int i = 0, id; i < returned; ++i) { cin >> id; present[id] = true; }
        bool missing = false;
        for (int id = 1; id <= n; ++id) if (!present[id]) { cout << id << ' '; missing = true; }
        if (!missing) cout << '*';
        cout << '\n';
    }
}
