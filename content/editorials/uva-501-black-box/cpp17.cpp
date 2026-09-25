#include <functional>
#include <iostream>
#include <queue>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 0; tc < tests; ++tc) {
        int m,n; cin >> m >> n; vector<long long> values(m); vector<int> queries(n);
        for (auto &value : values) cin >> value; for (int &used : queries) cin >> used;
        priority_queue<long long> lower; priority_queue<long long,vector<long long>,greater<long long>> upper; int inserted = 0;
        if (tc) cout << '\n';
        for (int rank = 0; rank < n; ++rank) {
            while (inserted < queries[rank]) {
                long long value = values[inserted++];
                if (!lower.empty() && value < lower.top()) { lower.push(value); upper.push(lower.top()); lower.pop(); }
                else upper.push(value);
            }
            lower.push(upper.top()); upper.pop(); cout << lower.top() << '\n';
        }
    }
}
