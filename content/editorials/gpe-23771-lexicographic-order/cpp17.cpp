#include <iostream>
#include <numeric>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    unsigned long long factorial[21]; factorial[0] = 1;
    for (int i = 1; i <= 20; ++i) factorial[i] = factorial[i - 1] * i;
    int tests; cin >> tests;
    for (int tc = 1; tc <= tests; ++tc) {
        string word; unsigned long long rank; cin >> word >> rank; int n = int(word.size()); --rank;
        vector<int> available(n); iota(available.begin(),available.end(),0); string order(n,'?');
        for (int i = 0; i < n; ++i) {
            int index = int(rank / factorial[n - i - 1]); rank %= factorial[n - i - 1];
            order[available[index]] = word[i]; available.erase(available.begin() + index);
        }
        cout << "Case " << tc << ": " << order << '\n';
    }
}
