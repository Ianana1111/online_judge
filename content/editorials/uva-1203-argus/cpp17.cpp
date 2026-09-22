#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    using Event=tuple<long long,int,int>;
    priority_queue<Event,vector<Event>,greater<Event>> events;
    string command;
    while(cin >> command && command!="#") {
        int id,period;cin >> id >> period;events.emplace(period,id,period);
    }
    int k;cin >> k;
    while(k--) {
        auto [time,id,period]=events.top();events.pop();
        cout << id << '\n';
        events.emplace(time+period,id,period);
    }
}
