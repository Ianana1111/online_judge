#include <algorithm>
#include <iomanip>
#include <iostream>
#include <map>
#include <set>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    map<int, vector<pair<int, int>>> events;
    int left, height, right;
    while (cin >> left >> height >> right) {
        events[left].push_back({height, 1});
        events[right].push_back({height, -1});
    }
    multiset<int> active{0};
    int previous = 0; bool first = true;
    for (const auto& [x, changes] : events) {
        for (auto [h, kind] : changes) {
            if (kind == 1) active.insert(h);
            else active.erase(active.find(h));
        }
        int current = *active.rbegin();
        if (current != previous) {
            if (!first) cout << ' ';
            cout << x << ' ' << current;
            first = false; previous = current;
        }
    }
    cout << '\n';
}
