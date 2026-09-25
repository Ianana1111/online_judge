#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, tc = 0;
    while (cin >> n && n > 0) {
        int capacity = 1, pastes = 0;
        while (capacity < n) { capacity *= 2; ++pastes; }
        cout << "Case " << ++tc << ": " << pastes << '\n';
    }
}
