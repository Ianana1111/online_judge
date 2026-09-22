#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        array<long long, 4> side;
        for (auto& value : side) cin >> value;
        sort(side.begin(), side.end());
        string answer;
        if (side[0] == side[3]) answer = "square";
        else if (side[0] == side[1] && side[2] == side[3]) answer = "rectangle";
        else if (side[0] + side[1] + side[2] > side[3]) answer = "quadrangle";
        else answer = "banana";
        cout << answer << '\n';
    }
}
