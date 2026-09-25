#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests; string line; getline(cin, line);
    for (int tc = 0; tc < tests; ++tc) {
        do { getline(cin, line); } while (line.find_first_not_of(" \t\r") == string::npos);
        istringstream indices(line); vector<int> position; int p;
        while (indices >> p) position.push_back(p);
        getline(cin, line); istringstream values(line); vector<string> answer(position.size());
        for (int index : position) { string value; values >> value; answer[index - 1] = value; }
        if (tc) cout << '\n';
        for (const string &value : answer) cout << value << '\n';
    }
}
