#include <algorithm>
#include <array>
#include <functional>
#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<array<int,8>> solutions; array<int,8> board;
    function<void(int,unsigned,unsigned,unsigned)> generate = [&](int col,unsigned rows,unsigned rising,unsigned falling) {
        if (col == 8) { solutions.push_back(board); return; }
        for (int row = 1; row <= 8; ++row) {
            unsigned rowBit = 1U << (row - 1), upBit = 1U << (row - 1 + col), downBit = 1U << (row - 1 - col + 7);
            if ((rows & rowBit) || (rising & upBit) || (falling & downBit)) continue;
            board[col] = row; generate(col + 1,rows | rowBit,rising | upBit,falling | downBit);
        }
    };
    generate(0,0,0,0);
    array<int,8> initial; int tc = 0;
    while (cin >> initial[0]) {
        for (int col = 1; col < 8; ++col) cin >> initial[col];
        int answer = 8;
        for (const auto &target : solutions) {
            int cost = 0;
            for (int col = 0; col < 8; ++col) cost += initial[col] != target[col];
            answer = min(answer,cost);
        }
        cout << "Case " << ++tc << ": " << answer << '\n';
    }
}
