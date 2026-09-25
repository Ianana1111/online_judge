#include <algorithm>
#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        vector<pair<string, int>> sites(10); int best = 0;
        for (auto &[url, score] : sites) { cin >> url >> score; best = max(best, score); }
        cout << "Case #" << tc << ":\n";
        for (const auto &[url, score] : sites) if (score == best) cout << url << '\n';
    }
}
