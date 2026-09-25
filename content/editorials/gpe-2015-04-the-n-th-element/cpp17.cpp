#include <algorithm>
#include <array>
#include <climits>
#include <iostream>
using namespace std;
using Integer = long long;

Integer value(const array<Integer, 3>& coefficients, int index) {
    return static_cast<Integer>(static_cast<__int128>(coefficients[0]) * index * index
        + static_cast<__int128>(coefficients[1]) * index + coefficients[2]);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int cases;
    cin >> cases;
    while (cases--) {
        array<Integer, 3> a, b;
        for (Integer& x : a) cin >> x;
        for (Integer& x : b) cin >> x;
        int n;
        cin >> n;
        int rank = n;
        int low = max(0, rank - n), high = min(n, rank);
        while (low <= high) {
            int takeA = low + (high - low) / 2;
            int takeB = rank - takeA;
            Integer aLeft = takeA ? value(a, takeA - 1) : LLONG_MIN;
            Integer aRight = takeA < n ? value(a, takeA) : LLONG_MAX;
            Integer bLeft = takeB ? value(b, takeB - 1) : LLONG_MIN;
            Integer bRight = takeB < n ? value(b, takeB) : LLONG_MAX;
            if (aLeft > bRight) high = takeA - 1;
            else if (bLeft > aRight) low = takeA + 1;
            else {
                Integer answer = max(aLeft, bLeft);
                cout << answer << '\n';
                break;
            }
        }
    }
}
