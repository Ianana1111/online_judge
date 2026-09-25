#include <iostream>
#include <string>
using namespace std;
int digitSum(const string& text) { int total = 0; for (char ch : text) total += ch - '0'; return total; }
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string number;
    while (cin >> number && number != "0") {
        int total = digitSum(number);
        cout << number;
        if (total % 9 != 0) cout << " is not a multiple of 9.\n";
        else {
            int degree = 1;
            while (total != 9) { total = digitSum(to_string(total)); ++degree; }
            cout << " is a multiple of 9 and has 9-degree " << degree << ".\n";
        }
    }
}
