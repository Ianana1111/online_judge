#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string line; getline(cin, line); int tests = stoi(line);
    for (int tc = 1; tc <= tests; ++tc) {
        if (tc > 1) cout << '\n';
        cout << "Case #" << tc << ":\n";
        bool started = false;
        while (getline(cin, line)) {
            istringstream input(line); string word, decoded;
            while (input >> word) {
                if (word.size() > decoded.size()) decoded.push_back(word[decoded.size()]);
            }
            if (decoded.empty()) {
                if (started) break;
                continue;
            }
            started = true;
            cout << decoded << '\n';
        }
    }
}
