#include <algorithm>
#include <iostream>
#include <set>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long original;
    while (cin >> original && original) {
        cout << "Original number was " << original << '\n';
        set<long long> seen{original}; long long current = original; int length = 0;
        while (true) {
            string digits = to_string(current); sort(digits.begin(), digits.end());
            long long low = stoll(digits); reverse(digits.begin(), digits.end()); long long high = stoll(digits);
            long long next = high - low; ++length;
            cout << high << " - " << low << " = " << next << '\n';
            if (seen.count(next)) break;
            seen.insert(next); current = next;
        }
        cout << "Chain length " << length << "\n\n";
    }
}
