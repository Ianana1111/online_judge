#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    bool opening = true; char ch;
    while (cin.get(ch)) {
        if (ch == '"') { cout << (opening ? "``" : "''"); opening = !opening; }
        else cout << ch;
    }
}
