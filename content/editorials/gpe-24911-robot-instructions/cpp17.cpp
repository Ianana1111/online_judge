#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        int n; cin >> n; vector<int> movement(n + 1); int position = 0;
        for (int i = 1; i <= n; ++i) {
            string command; cin >> command;
            if (command == "LEFT") movement[i] = -1;
            else if (command == "RIGHT") movement[i] = 1;
            else { string as; int previous; cin >> as >> previous; movement[i] = movement[previous]; }
            position += movement[i];
        }
        cout << position << '\n';
    }
}
