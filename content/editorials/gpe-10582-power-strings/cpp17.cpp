#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string s;
    while (getline(cin, s)) {
        if (!s.empty() && s.back() == '\r') s.pop_back();
        if (s == ".") break;
        int n = s.size(); vector<int> prefix(n, 0);
        for (int i = 1; i < n; ++i) {
            int length = prefix[i - 1];
            while (length && s[i] != s[length]) length = prefix[length - 1];
            if (s[i] == s[length]) ++length;
            prefix[i] = length;
        }
        int period = n - prefix[n - 1];
        cout << (n % period == 0 ? n / period : 1) << '\n';
    }
}
