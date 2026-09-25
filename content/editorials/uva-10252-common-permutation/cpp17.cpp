#include <algorithm>
#include <array>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string a, b;
    while (getline(cin, a) && getline(cin, b)) {
        array<int, 26> ca{}, cb{};
        for (char ch : a) if ('a' <= ch && ch <= 'z') ++ca[ch - 'a'];
        for (char ch : b) if ('a' <= ch && ch <= 'z') ++cb[ch - 'a'];
        for (int i = 0; i < 26; ++i) cout << string(min(ca[i], cb[i]), char('a' + i));
        cout << '\n';
    }
}
