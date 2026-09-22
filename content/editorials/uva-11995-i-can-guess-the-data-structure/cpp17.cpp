#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n) {
        stack<int> s; queue<int> q; priority_queue<int> p;
        bool stackOK = true, queueOK = true, priorityOK = true;
        for (int i = 0; i < n; ++i) {
            int op, x; cin >> op >> x;
            if (op == 1) { s.push(x); q.push(x); p.push(x); }
            else {
                if (s.empty() || s.top() != x) stackOK = false;
                if (q.empty() || q.front() != x) queueOK = false;
                if (p.empty() || p.top() != x) priorityOK = false;
                if (!s.empty()) s.pop(); if (!q.empty()) q.pop(); if (!p.empty()) p.pop();
            }
        }
        int candidates = int(stackOK) + int(queueOK) + int(priorityOK);
        if (candidates == 0) cout << "impossible\n";
        else if (candidates > 1) cout << "not sure\n";
        else cout << (stackOK ? "stack" : queueOK ? "queue" : "priority queue") << '\n';
    }
}
