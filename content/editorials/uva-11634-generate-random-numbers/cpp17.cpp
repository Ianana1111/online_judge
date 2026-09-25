#include <algorithm>
#include <array>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int value;
    while (cin >> value && value != 0) {
        array<bool, 10000> seen{};
        int count = 0;
        while (!seen[value]) {
            seen[value] = true; ++count;
            value = (value * value / 100) % 10000;
        }
        cout << count << '\n';
    }
}
