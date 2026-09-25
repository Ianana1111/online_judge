#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<string> lines; string line; size_t width = 0;
    while (getline(cin, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        width = max(width, line.size()); lines.push_back(line);
    }
    for (size_t column = 0; column < width; ++column) {
        for (int row = int(lines.size()) - 1; row >= 0; --row)
            cout << (column < lines[row].size() ? lines[row][column] : ' ');
        cout << '\n';
    }
}
