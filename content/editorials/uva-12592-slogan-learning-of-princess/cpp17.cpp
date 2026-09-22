#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n; cin >> n; cin.ignore(numeric_limits<streamsize>::max(), '\n');
    map<string, string> responses;
    for (int i = 0; i < n; ++i) {
        string first, second; getline(cin, first); getline(cin, second);
        if (!first.empty() && first.back() == '\r') first.pop_back();
        if (!second.empty() && second.back() == '\r') second.pop_back();
        responses[first] = second;
    }
    int queries; cin >> queries; cin.ignore(numeric_limits<streamsize>::max(), '\n');
    while (queries--) {
        string first; getline(cin, first);
        if (!first.empty() && first.back() == '\r') first.pop_back();
        cout << responses.at(first) << '\n';
    }
}
