#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int a, b;
    while (cin >> a >> b) {
        vector<pair<int, int>> faces(6); faces[0] = minmax(a, b);
        for (int i = 1; i < 6; ++i) { cin >> a >> b; faces[i] = minmax(a, b); }
        sort(faces.begin(), faces.end());
        bool pairs = faces[0] == faces[1] && faces[2] == faces[3] && faces[4] == faces[5];
        bool edges = faces[0].first == faces[2].first && faces[0].second == faces[4].first && faces[2].second == faces[4].second;
        cout << (pairs && edges ? "POSSIBLE" : "IMPOSSIBLE") << '\n';
    }
}
