#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    map<char, int> duration = {{'W',64},{'H',32},{'Q',16},{'E',8},{'S',4},{'T',2},{'X',1}};
    string song;
    while (cin >> song && song != "*") {
        int sum = 0, answer = 0;
        for (char note : song) {
            if (note == '/') { if (sum == 64) ++answer; sum = 0; }
            else sum += duration[note];
        }
        cout << answer << '\n';
    }
}
