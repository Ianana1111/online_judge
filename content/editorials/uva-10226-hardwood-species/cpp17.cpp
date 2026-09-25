#include <algorithm>
#include <iomanip>
#include <iostream>
#include <map>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string line; getline(cin, line); int tests = stoi(line);
    for (int tc = 0; tc < tests; ++tc) {
        map<string, long long> counts;
        long long total = 0;
        while (getline(cin, line)) {
            if (!line.empty() && line.back() == '\r') line.pop_back();
            if (line.empty()) {
                if (total > 0) break;
                continue;
            }
            ++counts[line]; ++total;
        }
        if (tc > 0) cout << '\n';
        for (const auto& [name, count] : counts) {
            long long scaled = (count * 1000000 + total / 2) / total;
            cout << name << ' ' << scaled / 10000 << '.'
                 << setw(4) << setfill('0') << scaled % 10000 << setfill(' ') << '\n';
        }
    }
}
