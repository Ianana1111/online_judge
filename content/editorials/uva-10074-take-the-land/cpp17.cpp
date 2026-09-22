#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int rows, columns;
    while (cin >> rows >> columns && (rows || columns)) {
        vector<vector<int>> grid(rows, vector<int>(columns));
        for (auto &row : grid) for (int &cell : row) cin >> cell;
        int answer = 0;
        for (int top = 0; top < rows; ++top) {
            vector<char> clear(columns, true);
            for (int bottom = top; bottom < rows; ++bottom) {
                int current = 0;
                for (int column = 0; column < columns; ++column) {
                    clear[column] = clear[column] && (grid[bottom][column] == 0);
                    if (clear[column]) ++current; else current = 0;
                    answer = max(answer, current * (bottom - top + 1));
                }
            }
        }
        cout << answer << '\n';
    }
}
