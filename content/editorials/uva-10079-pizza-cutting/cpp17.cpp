#include <iostream>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long cuts;
    while (cin >> cuts && cuts >= 0) {
        long long pieces = 1 + cuts * (cuts + 1) / 2;
        cout << pieces << '\n';
    }
}
