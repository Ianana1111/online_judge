#include <algorithm>
#include <cctype>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string word; char ch;
    auto flush = [&]() { reverse(word.begin(), word.end()); cout << word; word.clear(); };
    while (cin.get(ch)) {
        if (isspace(static_cast<unsigned char>(ch))) { flush(); cout << ch; }
        else word += ch;
    }
    flush();
}
