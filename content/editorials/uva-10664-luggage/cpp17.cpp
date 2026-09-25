#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests; string line; getline(cin, line);
    while (tests--) {
        getline(cin, line); istringstream input(line); vector<int> weights; int weight, total = 0;
        while (input >> weight) { weights.push_back(weight); total += weight; }
        bool possible = false;
        if (total % 2 == 0) {
            int target = total / 2; vector<char> reachable(target + 1, false); reachable[0] = true;
            for (int w : weights) for (int sum = target; sum >= w; --sum)
                reachable[sum] = reachable[sum] || reachable[sum - w];
            possible = reachable[target];
        }
        cout << (possible ? "YES" : "NO") << '\n';
    }
}
