#include <algorithm>
#include <array>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string name;
    while (cin >> name && name != "end") {
        array<int,10> lights{};
        for (int row = 0; row < 10; ++row) {
            string line; cin >> line;
            for (int col = 0; col < 10; ++col) if (line[col] == 'O') lights[row] |= 1 << col;
        }
        int answer = 101;
        for (int first = 0; first < 1024; ++first) {
            int previous = 0, press = first, count = 0;
            for (int row = 0; row < 10; ++row) {
                count += __builtin_popcount((unsigned)press);
                int next = lights[row] ^ press ^ ((press << 1) & 1023) ^ (press >> 1) ^ previous;
                previous = press; press = next;
            }
            if (press == 0) answer = min(answer,count);
        }
        cout << name << ' ' << (answer <= 100 ? answer : -1) << '\n';
    }
}
