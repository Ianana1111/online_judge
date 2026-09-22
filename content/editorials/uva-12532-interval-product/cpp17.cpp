#include <bits/stdc++.h>
using namespace std;
struct Fenwick {
    vector<int> tree;
    explicit Fenwick(int n): tree(n+1,0) {}
    void add(int at,int delta) { for (; at < (int)tree.size(); at += at & -at) tree[at] += delta; }
    int prefix(int at) const { int answer = 0; for (; at > 0; at -= at & -at) answer += tree[at]; return answer; }
    int range(int left,int right) const { return prefix(right) - prefix(left-1); }
};
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n,k;
    while (cin >> n >> k) {
        vector<int> value(n+1); Fenwick zeros(n),negatives(n);
        for (int i = 1; i <= n; ++i) { cin >> value[i]; zeros.add(i,value[i] == 0); negatives.add(i,value[i] < 0); }
        string answer;
        for (int j = 0; j < k; ++j) {
            char op; int left,right; cin >> op >> left >> right;
            if (op == 'C') {
                zeros.add(left,(right == 0) - (value[left] == 0));
                negatives.add(left,(right < 0) - (value[left] < 0)); value[left] = right;
            } else {
                if (zeros.range(left,right) > 0) answer += '0';
                else answer += negatives.range(left,right) % 2 ? '-' : '+';
            }
        }
        cout << answer << '\n';
    }
}
