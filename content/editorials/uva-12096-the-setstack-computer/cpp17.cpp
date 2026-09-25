#include <algorithm>
#include <iostream>
#include <iterator>
#include <map>
#include <set>
#include <stack>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; map<set<int>,int> ids; vector<set<int>> values; vector<int> stack;
        auto intern = [&](const set<int> &value) {
            auto found = ids.find(value); if (found != ids.end()) return found->second;
            int id = values.size(); values.push_back(value); ids[value] = id; return id;
        };
        int empty = intern({});
        for (int i = 0; i < n; ++i) {
            string op; cin >> op;
            if (op == "PUSH") stack.push_back(empty);
            else if (op == "DUP") stack.push_back(stack.back());
            else {
                int a = stack.back(); stack.pop_back(); int b = stack.back(); stack.pop_back(); set<int> result;
                if (op == "UNION") set_union(values[a].begin(),values[a].end(),values[b].begin(),values[b].end(),inserter(result,result.end()));
                else if (op == "INTERSECT") set_intersection(values[a].begin(),values[a].end(),values[b].begin(),values[b].end(),inserter(result,result.end()));
                else { result = values[b]; result.insert(a); }
                stack.push_back(intern(result));
            }
            cout << values[stack.back()].size() << '\n';
        }
        cout << "***\n";
    }
}
