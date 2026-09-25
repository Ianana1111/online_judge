#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    map<char, char> mirror;
    for (char ch : string("AHIMOTUVWXY18")) mirror[ch] = ch;
    for (auto pair : vector<pair<char,char>>{{'E','3'},{'J','L'},{'S','2'},{'Z','5'}}) { mirror[pair.first] = pair.second; mirror[pair.second] = pair.first; }
    string text;
    while (cin >> text) {
        bool palindrome = true, mirrored = true;
        for (int i = 0; i < int(text.size()); ++i) {
            char other = text[text.size() - 1 - i];
            if (text[i] != other) palindrome = false;
            auto found = mirror.find(text[i]);
            if (found == mirror.end() || found->second != other) mirrored = false;
        }
        cout << text << " -- is ";
        if (palindrome && mirrored) cout << "a mirrored palindrome.";
        else if (palindrome) cout << "a regular palindrome.";
        else if (mirrored) cout << "a mirrored string.";
        else cout << "not a palindrome.";
        cout << "\n\n";
    }
}
