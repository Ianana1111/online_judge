#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long n;
    string out;
    while (cin >> n && n != 0) {
        long long value = n <= 100 ? 91 : n - 10;
        out += "f91(" + to_string(n) + ") = " + to_string(value) + "\n";
    }
    cout << out;
}
