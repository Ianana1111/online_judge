#include <iostream>
#include <stack>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests; string line; getline(cin, line);
    while (tests--) {
        getline(cin, line); if (!line.empty() && line.back() == '\r') line.pop_back();
        vector<char> stack; bool valid = true;
        for (char ch : line) {
            if (ch == '(' || ch == '[') stack.push_back(ch);
            else {
                char expected = ch == ')' ? '(' : '[';
                if (stack.empty() || stack.back() != expected) { valid = false; break; }
                stack.pop_back();
            }
        }
        cout << (valid && stack.empty() ? "Yes" : "No") << '\n';
    }
}
