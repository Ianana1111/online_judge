#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string a, b;
    while (cin >> a >> b) {
        vector<int> digits(a.size() + b.size(), 0);
        for (int i = int(a.size()) - 1; i >= 0; --i)
            for (int j = int(b.size()) - 1; j >= 0; --j)
                digits[i + j + 1] += (a[i] - '0') * (b[j] - '0');
        for (int i = int(digits.size()) - 1; i > 0; --i) {
            digits[i - 1] += digits[i] / 10; digits[i] %= 10;
        }
        int first = 0;
        while (first + 1 < int(digits.size()) && digits[first] == 0) ++first;
        for (int i = first; i < int(digits.size()); ++i) cout << digits[i];
        cout << '\n';
    }
}
