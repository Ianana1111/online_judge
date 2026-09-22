#include <bits/stdc++.h>
using namespace std;
using Integer = long long;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<pair<Integer, int>> events;
    string line;
    while (getline(cin, line) && line != ".") {
        stringstream input(line);
        Integer left, right;
        if (input >> left >> right) {
            events.push_back({left, 1});
            events.push_back({right, -1});
        }
    }
    sort(events.begin(), events.end());
    Integer active = 0, answer = 0;
    Integer previous = events.empty() ? 0 : events.front().first;
    for (auto [position, change] : events) {
        answer += (position - previous) * (active * (active - 1) / 2);
        active += change;
        previous = position;
    }
    cout << answer << '\n';
}
