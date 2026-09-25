#include <algorithm>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        string s; cin >> s; int n = int(s.size());
        vector<vector<bool>> palindrome(n,vector<bool>(n));
        for (int left = n - 1; left >= 0; --left) for (int right = left; right < n; ++right)
            palindrome[left][right] = s[left] == s[right] && (right - left < 2 || palindrome[left + 1][right - 1]);
        vector<int> groups(n + 1,n + 1); groups[0] = 0;
        for (int end = 1; end <= n; ++end) for (int begin = 0; begin < end; ++begin)
            if (palindrome[begin][end - 1]) groups[end] = min(groups[end],groups[begin] + 1);
        cout << groups[n] << '\n';
    }
}
