#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string line;
    while (getline(cin, line)) {
        bool inside = false; int words = 0;
        for (unsigned char ch : line) {
            bool letter = ('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z');
            if (letter && !inside) ++words;
            inside = letter;
        }
        cout << words << '\n';
    }
}
