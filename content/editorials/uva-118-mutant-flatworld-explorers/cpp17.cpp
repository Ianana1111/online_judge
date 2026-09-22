#include <iostream>
#include <limits>
#include <string>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int maxX, maxY;
    cin >> maxX >> maxY;
    bool scent[51][51]{};
    const string directions = "NESW";
    const int dx[] = {0, 1, 0, -1};
    const int dy[] = {1, 0, -1, 0};
    int x, y;
    char heading;
    while (cin >> x >> y >> heading) {
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        string instructions;
        getline(cin, instructions);
        if (!instructions.empty() && instructions.back() == '\r') instructions.pop_back();
        int direction = static_cast<int>(directions.find(heading));
        bool lost = false;
        for (char command : instructions) {
            if (command == 'L') direction = (direction + 3) % 4;
            else if (command == 'R') direction = (direction + 1) % 4;
            else {
                int nextX = x + dx[direction], nextY = y + dy[direction];
                if (nextX < 0 || nextX > maxX || nextY < 0 || nextY > maxY) {
                    if (!scent[x][y]) {
                        scent[x][y] = true;
                        lost = true;
                        break;
                    }
                } else {
                    x = nextX;
                    y = nextY;
                }
            }
        }
        cout << x << ' ' << y << ' ' << directions[direction];
        if (lost) cout << " LOST";
        cout << '\n';
    }
}
