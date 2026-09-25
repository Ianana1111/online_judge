#include <algorithm>
#include <iostream>
#include <numeric>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
struct DSU {
    vector<int> parent, size;
    explicit DSU(int n) : parent(n + 1), size(n + 1, 1) { iota(parent.begin(), parent.end(), 0); }
    int find(int a) { while (parent[a] != a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; }
    void join(int a, int b) { a = find(a); b = find(b); if (a == b) return; if (size[a] < size[b]) swap(a,b); parent[b] = a; size[a] += size[b]; }
};
bool blank(const string &s) { return s.find_first_not_of(" \t\r") == string::npos; }
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests; string line; getline(cin, line);
    for (int tc = 0; tc < tests; ++tc) {
        do { getline(cin, line); } while (blank(line));
        int n = stoi(line); DSU dsu(n); int yes = 0, no = 0;
        while (getline(cin, line) && !blank(line)) {
            istringstream input(line); char op; int a, b; input >> op >> a >> b;
            if (op == 'c') dsu.join(a,b);
            else { if (dsu.find(a) == dsu.find(b)) ++yes; else ++no; }
        }
        if (tc) cout << '\n'; cout << yes << ',' << no << '\n';
    }
}
