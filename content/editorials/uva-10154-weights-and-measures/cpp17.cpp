#include <algorithm>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<pair<long long, long long>> turtles;
    long long weight, strength;
    while (cin >> weight >> strength) turtles.push_back({strength, weight});
    sort(turtles.begin(), turtles.end());
    priority_queue<long long> stack;
    long long total = 0;
    for (const auto &turtle : turtles) {
        stack.push(turtle.second);
        total += turtle.second;
        if (total > turtle.first) {
            total -= stack.top();
            stack.pop();
        }
    }
    cout << stack.size() << '\n';
}
