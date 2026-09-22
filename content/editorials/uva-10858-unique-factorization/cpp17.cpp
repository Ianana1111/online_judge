#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n) {
        vector<vector<int>> answers; vector<int> path;
        function<void(int,int)> search = [&](int rest,int minimum) {
            for (int divisor = minimum; divisor * divisor <= rest; ++divisor) if (rest % divisor == 0) {
                path.push_back(divisor); search(rest/divisor,divisor); path.pop_back();
            }
            if (!path.empty() && rest >= minimum) { path.push_back(rest); answers.push_back(path); path.pop_back(); }
        };
        search(n,2); sort(answers.begin(),answers.end()); cout << answers.size() << '\n';
        for (const auto &answer : answers) {
            for (int i = 0; i < (int)answer.size(); ++i) { if (i) cout << ' '; cout << answer[i]; }
            cout << '\n';
        }
    }
}
