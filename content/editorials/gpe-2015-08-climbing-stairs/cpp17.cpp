#include <algorithm>
#include <iostream>
#include <string>
using namespace std;
using Number = unsigned __int128;

string decimal(Number x) {
    if (x == 0) return "0";
    string answer;
    while (x > 0) {
        answer.push_back(static_cast<char>('0' + x % 10));
        x /= 10;
    }
    reverse(answer.begin(), answer.end());
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    while (cin >> n) {
        Number previous = 1, current = 1;
        for (int step = 2; step <= n; ++step) {
            Number next = previous + current;
            previous = current;
            current = next;
        }
        cout << decimal(current) << '\n';
    }
}
