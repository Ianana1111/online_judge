#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        string number; int size; cin >> number >> size;
        vector<int> divisors(size); for (int &divisor : divisors) cin >> divisor;
        bool wonderful = true;
        for (int divisor : divisors) {
            int remainder = 0;
            for (char digit : number) remainder = (10 * remainder + digit - '0') % divisor;
            wonderful &= remainder == 0;
        }
        cout << number << " - " << (wonderful ? "Wonderful." : "Simple.") << '\n';
    }
}
