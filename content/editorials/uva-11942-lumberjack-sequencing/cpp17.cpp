#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    cout << "Lumberjacks:\n";
    while (tests--) {
        array<int, 10> a;
        for (int& value : a) cin >> value;
        bool increasing = true, decreasing = true;
        for (int i = 1; i < 10; ++i) {
            if (a[i] <= a[i-1]) increasing = false;
            if (a[i] >= a[i-1]) decreasing = false;
        }
        cout << (increasing || decreasing ? "Ordered" : "Unordered") << '\n';
    }
}
