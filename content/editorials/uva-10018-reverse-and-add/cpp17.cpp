#include <iostream>
using namespace std;

unsigned long long reversed(unsigned long long value) {
    unsigned long long result = 0;
    while (value > 0) {
        result = result * 10 + value % 10;
        value /= 10;
    }
    return result;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int tests;
    cin >> tests;
    while (tests--) {
        unsigned long long value;
        cin >> value;
        int additions = 0;
        do {
            value += reversed(value);
            ++additions;
        } while (value != reversed(value));
        cout << additions << ' ' << value << '\n';
    }
}
