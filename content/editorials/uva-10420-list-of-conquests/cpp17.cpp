#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n;
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    map<string, int> counts;
    string line;
    for (int i = 0; i < n; ++i) {
        getline(cin, line);
        istringstream input(line);
        string country; input >> country;
        ++counts[country];
    }
    for (const auto& [country, count] : counts) cout << country << ' ' << count << '\n';
}
