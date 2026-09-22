#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string sequence; int tc = 0;
    while (cin >> sequence && sequence != "end") {
        vector<char> tops;
        for (char ship : sequence) {
            auto place = lower_bound(tops.begin(),tops.end(),ship);
            if (place == tops.end()) tops.push_back(ship); else *place = ship;
        }
        cout << "Case " << ++tc << ": " << tops.size() << '\n';
    }
}
