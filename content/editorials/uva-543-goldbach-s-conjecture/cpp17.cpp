#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int limit = 1000000; vector<bool> prime(limit,true); prime[0] = prime[1] = false;
    for (int p = 2; p * p < limit; ++p) if (prime[p]) for (int multiple = p * p; multiple < limit; multiple += p) prime[multiple] = false;
    int n;
    while (cin >> n && n) {
        int answer = 0;
        for (int a = 3; a <= n / 2; a += 2) if (prime[a] && prime[n - a]) { answer = a; break; }
        if (answer) cout << n << " = " << answer << " + " << n - answer << '\n';
        else cout << "Goldbach's conjecture is wrong.\n";
    }
}
