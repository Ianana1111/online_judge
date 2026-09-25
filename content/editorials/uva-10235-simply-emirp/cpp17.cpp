#include <iostream>
#include <string>
using namespace std;
bool isPrime(int n) {
    if (n < 2) return false;
    for (int d = 2; d * d <= n; ++d) if (n % d == 0) return false;
    return true;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n;
    while (cin >> n) {
        int reversed = 0;
        for (int rest = n; rest > 0; rest /= 10) reversed = reversed * 10 + rest % 10;
        string verdict;
        if (!isPrime(n)) verdict = "not prime";
        else if (reversed != n && isPrime(reversed)) verdict = "emirp";
        else verdict = "prime";
        cout << n << " is " << verdict << ".\n";
    }
}
