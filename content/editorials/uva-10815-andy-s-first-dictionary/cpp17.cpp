#include <iostream>
#include <set>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    set<string> dictionary;
    string word; char ch;
    auto flush = [&]() { if (!word.empty()) dictionary.insert(word); word.clear(); };
    while (cin.get(ch)) {
        if (ch >= 'A' && ch <= 'Z') ch = char(ch - 'A' + 'a');
        if (ch >= 'a' && ch <= 'z') word.push_back(ch);
        else flush();
    }
    flush();
    for (const string& item : dictionary) cout << item << '\n';
}
