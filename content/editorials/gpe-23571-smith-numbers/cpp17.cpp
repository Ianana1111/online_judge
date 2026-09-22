#include <bits/stdc++.h>
using namespace std;
int digitSum(long long value) {
    int sum = 0;
    while (value) { sum += int(value % 10); value /= 10; }
    return sum;
}
bool smith(long long value) {
    long long remaining = value; int sum = 0, count = 0;
    for (long long divisor = 2; divisor * divisor <= remaining; ++divisor) {
        while (remaining % divisor == 0) { remaining /= divisor; sum += digitSum(divisor); ++count; }
    }
    if (remaining > 1) { sum += digitSum(remaining); ++count; }
    return count > 1 && sum == digitSum(value);
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    while (tests--) {
        long long value; cin >> value; ++value;
        while (!smith(value)) ++value;
        cout << value << '\n';
    }
}
