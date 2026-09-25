#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string line;
    while (getline(cin,line)) {
        if (line == "0") break;
        istringstream input(line); int p,e,value = 1;
        while (input >> p >> e) for (int i = 0; i < e; ++i) value *= p;
        int rest = value - 1; vector<pair<int,int>> factors;
        for (int d = 2; d * d <= rest; ++d) {
            int count = 0;
            while (rest % d == 0) { rest /= d; ++count; }
            if (count) factors.push_back({d,count});
        }
        if (rest > 1) factors.push_back({rest,1});
        reverse(factors.begin(),factors.end());
        for (int i = 0; i < (int)factors.size(); ++i) {
            if (i) cout << ' ';
            cout << factors[i].first << ' ' << factors[i].second;
        }
        cout << '\n';
    }
}
