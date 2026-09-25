#include <algorithm>
#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 0; tc < tests; ++tc) {
        int n,m; cin >> n >> m; vector<pair<int,string>> entries;
        for (int k = 0; k < m; ++k) {
            string dna; cin >> dna; int inversions = 0;
            for (int i = 0; i < n; ++i) for (int j = i + 1; j < n; ++j) if (dna[i] > dna[j]) ++inversions;
            entries.push_back({inversions,dna});
        }
        stable_sort(entries.begin(),entries.end(),[](const auto &a,const auto &b) { return a.first < b.first; });
        if (tc) cout << '\n';
        for (const auto &entry : entries) cout << entry.second << '\n';
    }
}
