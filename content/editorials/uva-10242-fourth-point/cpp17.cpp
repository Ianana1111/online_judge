#include <array>
#include <cmath>
#include <iomanip>
#include <iostream>
#include <string>
using namespace std;

long long millimetres(const string& text) {
    return llround(stold(text) * 1000.0L);
}

void printCoordinate(long long value) {
    if (value < 0) cout << '-';
    long long magnitude = value < 0 ? -value : value;
    cout << magnitude / 1000 << '.' << setw(3) << setfill('0') << magnitude % 1000;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string first;
    while (cin >> first) {
        array<array<long long, 2>, 4> points{};
        points[0][0] = millimetres(first);
        string token;
        for (int i = 1; i < 8; ++i) {
            cin >> token;
            points[i / 2][i % 2] = millimetres(token);
        }
        array<long long, 2> common{};
        for (int i = 0; i < 2; ++i)
            for (int j = 2; j < 4; ++j)
                if (points[i] == points[j]) common = points[i];
        array<long long, 2> answer{};
        for (int axis = 0; axis < 2; ++axis) {
            for (const auto& point : points) answer[axis] += point[axis];
            answer[axis] -= 3 * common[axis];
        }
        printCoordinate(answer[0]);
        cout << ' ';
        printCoordinate(answer[1]);
        cout << '\n';
    }
}
