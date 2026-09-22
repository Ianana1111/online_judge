#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int LIMIT = 30000;
    vector<unsigned long long> ways(LIMIT + 1); ways[0] = 1;
    for (int coin : {1,5,10,25,50})
        for (int amount = coin; amount <= LIMIT; ++amount) ways[amount] += ways[amount - coin];
    int amount;
    while (cin >> amount) {
        if (ways[amount] == 1) cout << "There is only 1 way to produce " << amount << " cents change.\n";
        else cout << "There are " << ways[amount] << " ways to produce " << amount << " cents change.\n";
    }
}
