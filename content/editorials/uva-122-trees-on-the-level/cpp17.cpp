#include <bits/stdc++.h>
using namespace std;
struct Node { array<int,2> child{{-1,-1}}; string value; };
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<Node> nodes(1); bool valid = true; string token;
    while (cin >> token) {
        if (token == "()") {
            queue<int> pending; pending.push(0); vector<string> answer;
            while (!pending.empty()) {
                int u = pending.front(); pending.pop();
                if (nodes[u].value.empty()) valid = false;
                answer.push_back(nodes[u].value);
                for (int v : nodes[u].child) if (v != -1) pending.push(v);
            }
            if (!valid) cout << "not complete\n";
            else { for (int i = 0; i < (int)answer.size(); ++i) { if (i) cout << ' '; cout << answer[i]; } cout << '\n'; }
            nodes.assign(1,Node{}); valid = true; continue;
        }
        auto comma = token.find(','); string value = token.substr(1,comma-1),path = token.substr(comma+1,token.size()-comma-2);
        auto first = value.find_first_not_of('0'); value = value.substr(first);
        int at = 0;
        for (char step : path) {
            int side = step == 'R',next = nodes[at].child[side];
            if (next == -1) { next = nodes.size(); nodes[at].child[side] = next; nodes.push_back(Node{}); }
            at = next;
        }
        if (!nodes[at].value.empty()) valid = false;
        nodes[at].value = value;
    }
}
