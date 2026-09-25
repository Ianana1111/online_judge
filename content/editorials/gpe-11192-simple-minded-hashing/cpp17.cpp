#include <algorithm>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long count[27][352]{}; count[0][0] = 1;
    for (int value = 1; value <= 26; ++value)
        for (int length = 26; length >= 1; --length)
            for (int sum = 351; sum >= value; --sum)
                count[length][sum] += count[length - 1][sum - value];
    int length, sum, tc = 0;
    while (cin >> length >> sum && (length || sum)) {
        long long answer = length <= 26 && sum <= 351 ? count[length][sum] : 0;
        cout << "Case " << ++tc << ": " << answer << '\n';
    }
}
