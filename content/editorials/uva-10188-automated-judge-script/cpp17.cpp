#include <algorithm>
#include <cctype>
#include <iostream>
#include <limits>
#include <string>
#include <vector>
using namespace std;

vector<string> readLines(int n) {
    vector<string> result(n);
    for (string& line : result) {
        getline(cin, line);
        if (!line.empty() && line.back() == '\r') line.pop_back();
    }
    return result;
}

string visible(const vector<string>& lines) {
    string result;
    for (const string& line : lines)
        for (unsigned char ch : line)
            if (!isspace(ch)) result += ch;
    return result;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, run = 0;
    while (cin >> n && n != 0) {
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        auto standard = readLines(n);
        cin >> m;
        cin.ignore(numeric_limits<streamsize>::max(), '\n');
        auto team = readLines(m);
        size_t characters = 0;
        for (const string& line : standard) characters += line.size();
        string verdict;
        if (standard == team) verdict = "Accepted";
        else if (visible(standard) == visible(team)) verdict = "Presentation Error";
        else verdict = "Wrong Answer";
        cout << "Run #" << ++run << ": " << verdict << ' ' << characters << '\n';
    }
}
