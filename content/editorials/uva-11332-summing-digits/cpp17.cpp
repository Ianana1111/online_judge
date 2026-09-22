#include <iostream>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long value;
    while (cin >> value && value != 0) {
        while (value >= 10) {
            long long sum = 0;
            while (value > 0) {
                sum += value % 10;
                value /= 10;
            }
            value = sum;
        }
        cout << value << '\n';
    }
}
