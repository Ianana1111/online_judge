#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, tc = 0;
    while (cin >> n) {
        int answer = 0;
        while (n--) {
            string word; cin >> word; array<int, 26> counts{};
            for (char ch : word) ++counts[ch - 'a'];
            set<int> frequencies; int distinct = 0; bool unique = true;
            for (int count : counts) if (count > 0) {
                ++distinct;
                if (!frequencies.insert(count).second) unique = false;
            }
            if (distinct >= 2 && unique) ++answer;
        }
        cout << "Case " << ++tc << ": " << answer << '\n';
    }
}
