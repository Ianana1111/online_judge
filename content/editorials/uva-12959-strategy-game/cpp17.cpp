#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int players, rounds;
    while (cin >> players >> rounds && (players || rounds)) {
        vector<int> total(players, 0);
        for (int round = 0; round < rounds; ++round)
            for (int player = 0; player < players; ++player) { int score; cin >> score; total[player] += score; }
        int winner = 0;
        for (int player = 1; player < players; ++player) if (total[player] >= total[winner]) winner = player;
        cout << winner + 1 << '\n';
    }
}
