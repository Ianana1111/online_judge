#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    char ch;
    while (cin.get(ch)) {
        if (ch == '\n' || ch == '\r') cout << ch;
        else {
            int value = static_cast<unsigned char>(ch) - 7;
            if (value < 32) value += 95;
            cout << char(value);
        }
    }
}
