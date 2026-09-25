#include <algorithm>
#include <array>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<bool> prime(2001, true);
    prime[0] = prime[1] = false;
    for (int p = 2; p * p <= 2000; ++p)
        if (prime[p]) for (int multiple = p * p; multiple <= 2000; multiple += p) prime[multiple] = false;
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        string text; cin >> text;
        array<int, 128> count{};
        for (unsigned char ch : text) ++count[ch];
        string answer;
        for (int ch = 0; ch < 128; ++ch)
            if (prime[count[ch]]) answer += char(ch);
        cout << "Case " << tc << ": " << (answer.empty() ? "empty" : answer) << '\n';
    }
}
