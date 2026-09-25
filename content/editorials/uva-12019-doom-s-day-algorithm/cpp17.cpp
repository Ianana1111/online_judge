#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    const int days[] = {31,28,31,30,31,30,31,31,30,31,30,31};
    const string weekday[] = {"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"};
    int tests; cin >> tests;
    while (tests--) {
        int month, day; cin >> month >> day;
        int offset = day - 1;
        for (int m = 1; m < month; ++m) offset += days[m - 1];
        cout << weekday[(5 + offset) % 7] << '\n';
    }
}
