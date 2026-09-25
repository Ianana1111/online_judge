#include <iostream>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    long long a, b, c, divisor, limit;
    while (cin >> a >> b >> c >> divisor >> limit && (a || b || c || divisor || limit)) {
        int answer = 0;
        for (long long x = 0; x <= limit; ++x) {
            long long value = (a * x + b) * x + c;
            if (value % divisor == 0) ++answer;
        }
        cout << answer << '\n';
    }
}
