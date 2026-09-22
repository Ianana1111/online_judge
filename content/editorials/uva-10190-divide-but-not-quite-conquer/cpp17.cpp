#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    long long n, m;
    while (cin >> n >> m) {
        if (n <= 1 || m <= 1) {
            cout << "Boring!\n";
            continue;
        }
        vector<long long> sequence{n};
        long long current = n;
        while (current > 1 && current % m == 0) {
            current /= m;
            sequence.push_back(current);
        }
        if (current != 1) {
            cout << "Boring!\n";
            continue;
        }
        for (size_t i = 0; i < sequence.size(); ++i) {
            if (i) cout << ' ';
            cout << sequence[i];
        }
        cout << '\n';
    }
}
