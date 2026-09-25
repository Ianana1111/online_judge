#include <iostream>
#include <set>
#include <tuple>
#include <utility>
#include <vector>
using namespace std;
using Integer = __int128;

Integer magnitude(Integer x) { if (x < 0) return -x; return x; }
Integer gcdInteger(Integer a, Integer b) {
    a = magnitude(a); b = magnitude(b);
    while (b != 0) {
        Integer remainder = a % b;
        a = b; b = remainder;
    }
    return a;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int cases;
    cin >> cases;
    while (cases--) {
        int n;
        cin >> n;
        vector<pair<long long, long long>> points(n);
        for (auto& p : points) cin >> p.first >> p.second;
        set<tuple<Integer, Integer, Integer>> lines;
        for (int i = 0; i < n; ++i) {
            for (int j = 0; j < i; ++j) {
                Integer x = points[i].first, y = points[i].second;
                Integer u = points[j].first, v = points[j].second;
                Integer a = v - y, b = x - u;
                Integer c = -(a * x + b * y);
                Integer divisor = gcdInteger(gcdInteger(a, b), c);
                a /= divisor; b /= divisor; c /= divisor;
                if (a < 0 || (a == 0 && b < 0)) { a = -a; b = -b; c = -c; }
                lines.insert({a, b, c});
            }
        }
        cout << lines.size() << '\n';
    }
}
