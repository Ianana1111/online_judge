#include <array>
#include <functional>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int limit = 10000000; vector<bool> prime(limit,true); prime[0] = prime[1] = false;
    for (int p = 2; p*p < limit; ++p) if (prime[p]) for (int multiple = p*p; multiple < limit; multiple += p) prime[multiple] = false;
    int tests; cin >> tests;
    while (tests--) {
        string digits; cin >> digits; array<int,10> remaining{}; for (char digit : digits) ++remaining[digit-'0'];
        int answer = 0;
        function<void(int,int)> search = [&](int value,int used) {
            if (prime[value]) ++answer;
            for (int digit = 0; digit <= 9; ++digit) if (remaining[digit]) {
                if (used == 0 && digit == 0) continue;
                --remaining[digit]; search(value*10+digit,used+1); ++remaining[digit];
            }
        };
        search(0,0); cout << answer << '\n';
    }
}
