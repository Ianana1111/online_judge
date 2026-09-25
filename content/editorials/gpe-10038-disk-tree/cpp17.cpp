#include <algorithm>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
struct Node { map<string,int> children; };
void printTree(const vector<Node>& nodes, int u, int depth) {
    for (const auto &[name, v] : nodes[u].children) {
        cout << string(depth, ' ') << name << '\n';
        printTree(nodes, v, depth + 1);
    }
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n) {
        vector<Node> nodes(1);
        while (n--) {
            string path; cin >> path; stringstream parts(path); string name; int u = 0;
            while (getline(parts, name, '\\')) {
                if (!nodes[u].children.count(name)) {
                    int next = nodes.size(); nodes[u].children[name] = next; nodes.push_back(Node{});
                }
                u = nodes[u].children[name];
            }
        }
        printTree(nodes, 0, 0); cout << '\n';
    }
}
