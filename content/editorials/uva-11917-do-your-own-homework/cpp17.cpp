#include <algorithm>
#include <iostream>
#include <map>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        int n; cin >> n;
        map<string, int> days;
        for (int i = 0; i < n; ++i) { string subject; int time; cin >> subject >> time; days[subject] = time; }
        int deadline; string wanted; cin >> deadline >> wanted;
        auto found = days.find(wanted);
        string result;
        if (found == days.end() || found->second > deadline + 5) result = "Do your own homework!";
        else if (found->second <= deadline) result = "Yesss";
        else result = "Late";
        cout << "Case " << tc << ": " << result << '\n';
    }
}
