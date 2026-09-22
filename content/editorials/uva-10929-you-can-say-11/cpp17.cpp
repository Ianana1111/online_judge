#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    string number;
    while (cin >> number && number != "0") {
        int remainder = 0;
        for (char ch : number) remainder = (remainder * 10 + ch - '0') % 11;
        cout << number << (remainder == 0 ? " is a multiple of 11.\n" : " is not a multiple of 11.\n");
    }
}
