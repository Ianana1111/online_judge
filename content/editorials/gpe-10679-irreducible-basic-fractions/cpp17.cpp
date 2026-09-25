#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long n;
    while (cin >> n && n) {
        long long remaining = n, answer = n;
        for (long long prime = 2; prime * prime <= remaining; ++prime) if (remaining % prime == 0) {
            answer -= answer / prime;
            while (remaining % prime == 0) remaining /= prime;
        }
        if (remaining > 1) answer -= answer / remaining;
        cout << answer << '\n';
    }
}
