#include <cstdlib>
#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n && n != 0) {
        long long balance = 0, work = 0;
        for (int i = 0; i < n; ++i) {
            long long value; cin >> value;
            balance += value;
            work += llabs(balance);
        }
        cout << work << '\n';
    }
}
