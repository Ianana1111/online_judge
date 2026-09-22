#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int limit = 6000;
    vector<long long> ways(limit + 1); ways[0] = 1;
    for (int coin : {1, 2, 4, 10, 20, 40, 100, 200, 400, 1000, 2000})
        for (int sum = coin; sum <= limit; ++sum) ways[sum] += ways[sum - coin];
    string token;
    while (cin >> token) {
        size_t dot = token.find('.');
        string whole = dot == string::npos ? token : token.substr(0, dot);
        string fraction = dot == string::npos ? "" : token.substr(dot + 1);
        fraction += "00";
        int cents = (whole.empty() ? 0 : stoi(whole)) * 100 + (fraction[0] - '0') * 10 + fraction[1] - '0';
        if (cents == 0) break;
        string amount = to_string(cents / 100) + "." + char('0' + cents % 100 / 10) + char('0' + cents % 10);
        cout << setw(6) << amount << setw(17) << ways[cents / 5] << '\n';
    }
}
