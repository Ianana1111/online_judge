#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int LIMIT = 7489;
    vector<unsigned long long> ways(LIMIT + 1); ways[0] = 1;
    for (int coin : {1,5,10,25,50})
        for (int amount = coin; amount <= LIMIT; ++amount) ways[amount] += ways[amount - coin];
    int amount;
    while (cin >> amount) {
        cout << ways[amount] << '\n';
    }
}
