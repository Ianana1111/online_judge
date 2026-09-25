#include <algorithm>
#include <array>
#include <functional>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        string first,second; cin >> first >> second; array<array<bool,32>,32> black{};
        function<void(const string&,int&,int,int,int)> paint = [&](const string &tree,int &position,int row,int col,int side) {
            char kind = tree[position++];
            if (kind == 'f') { for (int r = row; r < row+side; ++r) for (int c = col; c < col+side; ++c) black[r][c] = true; }
            else if (kind == 'p') {
                int half = side/2;
                paint(tree,position,row,col+half,half); paint(tree,position,row,col,half);
                paint(tree,position,row+half,col,half); paint(tree,position,row+half,col+half,half);
            }
        };
        int position = 0; paint(first,position,0,0,32);
        position = 0; paint(second,position,0,0,32);
        int count = 0; for (const auto &row : black) for (bool pixel : row) count += pixel;
        cout << "There are " << count << " black pixels.\n";
    }
}
