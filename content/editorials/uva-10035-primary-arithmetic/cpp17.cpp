#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long a, b;
    while (cin >> a >> b && (a != 0 || b != 0)) {
        int carry = 0, operations = 0;
        while (a != 0 || b != 0) {
            int sum = int(a % 10 + b % 10) + carry;
            carry = sum >= 10;
            operations += carry;
            a /= 10; b /= 10;
        }
        if (operations == 0) cout << "No carry operation.\n";
        else cout << operations << " carry operation" << (operations == 1 ? "." : "s.") << '\n';
    }
}
