#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n) {
        vector<pair<int,int>> products;
        for (int i = 0; i < n; ++i) { int profit,deadline; cin >> profit >> deadline; products.push_back({deadline,profit}); }
        sort(products.begin(),products.end()); priority_queue<int,vector<int>,greater<int>> selected;
        long long total = 0;
        for (auto [deadline,profit] : products) {
            selected.push(profit); total += profit;
            if ((int)selected.size() > deadline) { total -= selected.top(); selected.pop(); }
        }
        cout << total << '\n';
    }
}
