#include <array>
#include <iostream>
#include <string>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int count;
    while (cin >> count && count != 0) {
        // Positions: top, bottom, north, south, west, east.
        array<int, 6> face{1, 6, 2, 5, 3, 4};
        for (int step = 0; step < count; ++step) {
            string direction;
            cin >> direction;
            auto old = face;
            if (direction == "north") {
                face = {old[3], old[2], old[0], old[1], old[4], old[5]};
            } else if (direction == "south") {
                face = {old[2], old[3], old[1], old[0], old[4], old[5]};
            } else if (direction == "west") {
                face = {old[5], old[4], old[2], old[3], old[0], old[1]};
            } else {
                face = {old[4], old[5], old[2], old[3], old[1], old[0]};
            }
        }
        cout << face[0] << '\n';
    }
}
