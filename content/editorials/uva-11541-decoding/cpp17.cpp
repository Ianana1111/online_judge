#include <algorithm>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        string encoded, decoded; cin >> encoded;
        size_t i = 0;
        while (i < encoded.size()) {
            char letter = encoded[i++]; int count = 0;
            while (i < encoded.size() && encoded[i] >= '0' && encoded[i] <= '9') {
                count = count * 10 + encoded[i] - '0'; ++i;
            }
            decoded.append(count, letter);
        }
        cout << "Case " << tc << ": " << decoded << '\n';
    }
}
