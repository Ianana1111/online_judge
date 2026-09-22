#include <iostream>
#include <set>
using namespace std;

int nextValue(int value) {
    int total = 0;
    while (value > 0) {
        int digit = value % 10;
        total += digit * digit;
        value /= 10;
    }
    return total;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int tests;
    cin >> tests;
    for (int caseNo = 1; caseNo <= tests; ++caseNo) {
        int original;
        cin >> original;
        int value = original;
        set<int> seen;
        while (value != 1 && !seen.count(value)) {
            seen.insert(value);
            value = nextValue(value);
        }
        cout << "Case #" << caseNo << ": " << original
             << (value == 1 ? " is a Happy number.\n" : " is an Unhappy number.\n");
    }
}
