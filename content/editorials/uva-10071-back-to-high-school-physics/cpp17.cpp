#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long velocity, time;
    while (cin >> velocity >> time) cout << 2 * velocity * time << '\n';
}
