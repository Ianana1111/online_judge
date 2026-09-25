#include <algorithm>
#include <deque>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    static int owner[1000000]; int teams, scenario = 0;
    while (cin >> teams && teams) {
        for (int team = 0; team < teams; ++team) {
            int count; cin >> count;
            while (count--) { int member; cin >> member; owner[member] = team; }
        }
        vector<deque<int>> members(teams); deque<int> active;
        cout << "Scenario #" << ++scenario << '\n';
        string command;
        while (cin >> command && command != "STOP") {
            if (command == "ENQUEUE") {
                int value; cin >> value; int team = owner[value];
                if (members[team].empty()) active.push_back(team);
                members[team].push_back(value);
            } else {
                int team = active.front(); cout << members[team].front() << '\n'; members[team].pop_front();
                if (members[team].empty()) active.pop_front();
            }
        }
        cout << '\n';
    }
}
