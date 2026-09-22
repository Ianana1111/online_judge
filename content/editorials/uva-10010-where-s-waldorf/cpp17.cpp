#include <cctype>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

void lowercase(string& text) {
    for (char& ch : text) ch = static_cast<char>(tolower(static_cast<unsigned char>(ch)));
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int tests;
    cin >> tests;
    for (int test = 0; test < tests; ++test) {
        int rows, cols;
        cin >> rows >> cols;
        vector<string> grid(rows);
        for (auto& row : grid) { cin >> row; lowercase(row); }
        if (test) cout << '\n';
        int queries;
        cin >> queries;
        while (queries--) {
            string word;
            cin >> word;
            lowercase(word);
            bool found = false;
            for (int r = 0; r < rows && !found; ++r) {
                for (int c = 0; c < cols && !found; ++c) {
                    for (int dr = -1; dr <= 1 && !found; ++dr) {
                        for (int dc = -1; dc <= 1 && !found; ++dc) {
                            if (dr == 0 && dc == 0) continue;
                            bool matches = true;
                            for (int k = 0; k < static_cast<int>(word.size()); ++k) {
                                int nr = r + k * dr, nc = c + k * dc;
                                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols || grid[nr][nc] != word[k]) {
                                    matches = false;
                                    break;
                                }
                            }
                            if (matches) {
                                cout << r + 1 << ' ' << c + 1 << '\n';
                                found = true;
                            }
                        }
                    }
                }
            }
        }
    }
}
