#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

const int CACHE_LIMIT = 1000000;
vector<int> memo(CACHE_LIMIT + 1, 0);

int cycleLength(unsigned long long n) {
    vector<unsigned long long> path;
    while (n > CACHE_LIMIT || memo[n] == 0) {
        path.push_back(n);
        n = (n % 2 == 0) ? n / 2 : 3 * n + 1;
    }
    int length = memo[n];
    for (auto it = path.rbegin(); it != path.rend(); ++it) {
        ++length;
        if (*it <= CACHE_LIMIT) memo[*it] = length;
    }
    return length;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    memo[1] = 1;
    int first, second;
    while (cin >> first >> second) {
        int answer = 0;
        for (int n = min(first, second); n <= max(first, second); ++n) {
            answer = max(answer, cycleLength(n));
        }
        cout << first << ' ' << second << ' ' << answer << '\n';
    }
}
