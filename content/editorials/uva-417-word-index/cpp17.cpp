#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long choose[27][6]{};
    for (int n = 0; n <= 26; ++n) {
        choose[n][0] = 1;
        for (int k = 1; k <= min(n,5); ++k) choose[n][k] = (n ? choose[n - 1][k - 1] : 0) + (n ? choose[n - 1][k] : 0);
    }
    string word;
    while (cin >> word) {
        bool valid = true;
        for (size_t i = 1; i < word.size(); ++i) if (word[i] <= word[i - 1]) valid = false;
        if (!valid) { cout << 0 << '\n'; continue; }
        int length = int(word.size()), previous = -1; long long answer = 1;
        for (int len = 1; len < length; ++len) answer += choose[26][len];
        for (int i = 0; i < length; ++i) {
            int current = word[i] - 'a', remaining = length - i - 1;
            for (int candidate = previous + 1; candidate < current; ++candidate) answer += choose[25 - candidate][remaining];
            previous = current;
        }
        cout << answer << '\n';
    }
}
