#include <iomanip>
#include <iostream>
using namespace std;
void printNumber(long long n) {
    if (n >= 10000000) { printNumber(n / 10000000); cout << " kuti"; n %= 10000000; }
    if (n >= 100000) { cout << ' ' << n / 100000 << " lakh"; n %= 100000; }
    if (n >= 1000) { cout << ' ' << n / 1000 << " hajar"; n %= 1000; }
    if (n >= 100) { cout << ' ' << n / 100 << " shata"; n %= 100; }
    if (n != 0) cout << ' ' << n;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long n; int tc = 0;
    while (cin >> n) {
        cout << setw(4) << ++tc << '.';
        if (n == 0) cout << " 0";
        else printNumber(n);
        cout << '\n';
    }
}
