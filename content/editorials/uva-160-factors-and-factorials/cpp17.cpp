#include <array>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    vector<int> primes; array<bool,101> composite{};
    for (int p = 2; p <= 100; ++p) if (!composite[p]) {
        primes.push_back(p);
        for (int multiple = p * p; multiple <= 100; multiple += p) composite[multiple] = true;
    }
    int n;
    while (cin >> n && n) {
        cout << setw(3) << n << "! ="; int column = 0;
        for (int p : primes) {
            if (p > n) break;
            int exponent = 0;
            for (int quotient = n / p; quotient > 0; quotient /= p) exponent += quotient;
            if (column == 15) { cout << '\n' << string(6,' '); column = 0; }
            cout << setw(3) << exponent; ++column;
        }
        cout << '\n';
    }
}
