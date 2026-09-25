#include <algorithm>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int low = 1, high = 10, guess; string first, second;
    while (cin >> guess && guess != 0) {
        cin >> first >> second;
        if (first == "too" && second == "high") high = min(high, guess - 1);
        else if (first == "too" && second == "low") low = max(low, guess + 1);
        else {
            cout << (low <= guess && guess <= high ? "Stan may be honest" : "Stan is dishonest") << '\n';
            low = 1; high = 10;
        }
    }
}
