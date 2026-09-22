#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int tests;
    cin >> tests;
    for (int test = 1; test <= tests; ++test) {
        char label, equals;
        int n;
        cin >> label >> equals >> n;
        vector<long long> values(n * n);
        bool symmetric = true;
        for (auto& value : values) {
            cin >> value;
            if (value < 0) symmetric = false;
        }
        for (size_t i = 0; i < values.size(); ++i)
            if (values[i] != values[values.size() - 1 - i]) symmetric = false;
        cout << "Test #" << test << ": "
             << (symmetric ? "Symmetric.\n" : "Non-symmetric.\n");
    }
}
