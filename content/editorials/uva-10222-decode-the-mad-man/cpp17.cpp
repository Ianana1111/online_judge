#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> keyboard = {"`1234567890-=", "qwertyuiop[]\\", "asdfghjkl;'", "zxcvbnm,./"};
    array<char, 256> decode{};
    for (const string& row : keyboard)
        for (size_t i = 2; i < row.size(); ++i)
            decode[static_cast<unsigned char>(row[i])] = row[i - 2];

    int cases;
    cin >> cases;
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
    while (cases--) {
        string line;
        getline(cin, line);
        for (unsigned char ch : line) {
            unsigned char lower = static_cast<unsigned char>(tolower(ch));
            cout << (decode[lower] ? decode[lower] : static_cast<char>(ch));
        }
        cout << '\n';
    }
}
