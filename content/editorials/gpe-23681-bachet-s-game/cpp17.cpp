#include <iostream>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, m;
    while (cin >> n >> m) {
        vector<long long> moves(m); for (long long &x : moves) cin >> x;
        vector<char> winning(n + 1, false);
        for (int stones = 1; stones <= n; ++stones)
            for (long long take : moves)
                if (take <= stones && !winning[stones - take]) { winning[stones] = true; break; }
        cout << (winning[n] ? "Stan wins" : "Ollie wins") << '\n';
    }
}
