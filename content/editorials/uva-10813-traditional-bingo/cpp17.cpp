#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int card[5][5]{};
        for (int r = 0; r < 5; ++r) for (int c = 0; c < 5; ++c)
            if (r != 2 || c != 2) cin >> card[r][c];
        int called[76]{};
        for (int time = 1; time <= 75; ++time) {
            int number; cin >> number; called[number] = time;
        }
        int answer = 75, diagonal1 = 0, diagonal2 = 0;
        for (int r = 0; r < 5; ++r) {
            int row = 0, column = 0;
            for (int c = 0; c < 5; ++c) {
                row = max(row, called[card[r][c]]);
                column = max(column, called[card[c][r]]);
            }
            answer = min({answer, row, column});
            diagonal1 = max(diagonal1, called[card[r][r]]);
            diagonal2 = max(diagonal2, called[card[r][4-r]]);
        }
        answer = min({answer, diagonal1, diagonal2});
        cout << "BINGO after " << answer << " numbers announced\n";
    }
}
