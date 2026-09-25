#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    while (cin >> n) {
        vector<long long> a(n);
        for (auto& x : a) cin >> x;
        long long inversions = 0;
        for (int i = 0; i < n; ++i)
            for (int j = i + 1; j < n; ++j)
                if (a[i] > a[j]) ++inversions;
        cout << "Minimum exchange operations : " << inversions << '\n';
    }
}
