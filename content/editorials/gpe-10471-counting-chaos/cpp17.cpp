#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<int> valid;
    for (int time = 0; time < 1440; ++time) {
        int hours = time / 60, minutes = time % 60;
        string digits = to_string(hours * 100 + minutes);
        string reversed = digits; reverse(reversed.begin(),reversed.end());
        if (digits == reversed) valid.push_back(time);
    }
    int tests; cin >> tests;
    while (tests--) {
        string text; cin >> text; int time = stoi(text.substr(0,2)) * 60 + stoi(text.substr(3,2));
        auto next = upper_bound(valid.begin(),valid.end(),time);
        int answer = next == valid.end() ? valid.front() : *next;
        cout << setfill('0') << setw(2) << answer / 60 << ':' << setw(2) << answer % 60 << '\n';
    }
}
