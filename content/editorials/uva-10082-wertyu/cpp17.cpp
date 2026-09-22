#include <array>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    const vector<string> rows = {
        "`1234567890-=", "QWERTYUIOP[]\\", "ASDFGHJKL;'", "ZXCVBNM,./"
    };
    array<char, 256> decoded{};
    for (int i = 0; i < 256; ++i) decoded[i] = static_cast<char>(i);
    for (const auto& row : rows)
        for (size_t i = 1; i < row.size(); ++i)
            decoded[static_cast<unsigned char>(row[i])] = row[i - 1];
    string line;
    while (getline(cin, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        for (unsigned char ch : line) cout << decoded[ch];
        cout << '\n';
    }
}
