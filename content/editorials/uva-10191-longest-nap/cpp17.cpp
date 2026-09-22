#include <bits/stdc++.h>
using namespace std;
int minutes(const string &time) { return stoi(time.substr(0,2)) * 60 + stoi(time.substr(3,2)); }
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, day = 0; string line;
    while (cin >> n) {
        getline(cin,line); vector<pair<int,int>> appointments;
        for (int i = 0; i < n; ++i) {
            getline(cin,line); istringstream input(line); string start,end; input >> start >> end;
            appointments.push_back({minutes(start),minutes(end)});
        }
        appointments.push_back({1080,1080}); sort(appointments.begin(),appointments.end());
        int cursor = 600, bestStart = 600, longest = 0;
        for (auto [start,end] : appointments) {
            if (start - cursor > longest) { longest = start - cursor; bestStart = cursor; }
            cursor = max(cursor,end);
        }
        cout << "Day #" << ++day << ": the longest nap starts at " << setfill('0') << setw(2) << bestStart / 60 << ':' << setw(2) << bestStart % 60 << " and will last for ";
        if (longest >= 60) cout << longest / 60 << " hours and ";
        cout << longest % 60 << " minutes.\n";
    }
}
