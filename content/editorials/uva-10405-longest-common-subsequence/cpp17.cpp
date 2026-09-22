#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string a, b;
    while (getline(cin, a) && getline(cin, b)) {
        if (!a.empty() && a.back() == '\r') a.pop_back();
        if (!b.empty() && b.back() == '\r') b.pop_back();
        vector<int> previous(b.size() + 1, 0), current(b.size() + 1, 0);
        for (char ch : a) {
            current[0] = 0;
            for (int j = 1; j <= int(b.size()); ++j) {
                if (ch == b[j - 1]) current[j] = previous[j - 1] + 1;
                else current[j] = max(previous[j], current[j - 1]);
            }
            swap(previous, current);
        }
        cout << previous[b.size()] << '\n';
    }
}
