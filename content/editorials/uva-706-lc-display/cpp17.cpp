#include <iostream>
#include <string>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // Bits: top, upper-right, lower-right, bottom, lower-left, upper-left, middle.
    const int mask[10] = {0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f};
    int size;
    string number;
    while (cin >> size >> number && !(size == 0 && number == "0")) {
        for (int row = 0; row < 2 * size + 3; ++row) {
            for (size_t index = 0; index < number.size(); ++index) {
                if (index) cout << ' ';
                int segments = mask[number[index] - '0'];
                if (row == 0 || row == size + 1 || row == 2 * size + 2) {
                    int bit = row == 0 ? 0 : row == size + 1 ? 6 : 3;
                    cout << ' ' << string(size, segments & (1 << bit) ? '-' : ' ') << ' ';
                } else {
                    bool upper = row < size + 1;
                    int leftBit = upper ? 5 : 4, rightBit = upper ? 1 : 2;
                    cout << (segments & (1 << leftBit) ? '|' : ' ')
                         << string(size, ' ')
                         << (segments & (1 << rightBit) ? '|' : ' ');
                }
            }
            cout << '\n';
        }
        cout << '\n';
    }
}
