#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        vector<long long> expenses(n); long long sum = 0;
        for (auto &cents : expenses) {
            string text; cin >> text; size_t dot = text.find('.');
            cents = stoll(text.substr(0,dot)) * 100 + stoll(text.substr(dot + 1)); sum += cents;
        }
        long long low = sum / n, high = (sum + n - 1) / n, give = 0, receive = 0;
        for (long long value : expenses) {
            give += max(0LL,value - high);
            receive += max(0LL,low - value);
        }
        long long answer = max(give,receive);
        cout << '$' << answer / 100 << '.' << setfill('0') << setw(2) << answer % 100 << '\n';
    }
}
