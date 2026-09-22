#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int queries; cin >> queries; vector<string> dreams;
    while (queries--) {
        string command; cin >> command;
        if (command == "Sleep") { string name; cin >> name; dreams.push_back(name); }
        else if (command == "Kick") { if (!dreams.empty()) dreams.pop_back(); }
        else if (command == "Test") cout << (dreams.empty() ? "Not in a dream" : dreams.back()) << '\n';
    }
}
