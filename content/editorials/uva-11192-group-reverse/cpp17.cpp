#include <algorithm>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int groups; string text;
    while (cin >> groups && groups != 0) {
        cin >> text;
        int size = int(text.size()) / groups;
        for (int start = 0; start < int(text.size()); start += size)
            reverse(text.begin() + start, text.begin() + start + size);
        cout << text << '\n';
    }
}
