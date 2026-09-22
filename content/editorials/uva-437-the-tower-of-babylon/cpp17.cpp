#include <bits/stdc++.h>
using namespace std;
struct Block { long long x, y, height; };
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int n, tc = 0;
    while (cin >> n && n) {
        vector<Block> blocks;
        for (int i = 0; i < n; ++i) {
            long long d[3]; cin >> d[0] >> d[1] >> d[2];
            for (int h = 0; h < 3; ++h) {
                long long x = d[(h + 1) % 3], y = d[(h + 2) % 3];
                if (x > y) swap(x,y); blocks.push_back({x,y,d[h]});
            }
        }
        sort(blocks.begin(),blocks.end(),[](const Block &a,const Block &b) { return tie(a.x,a.y) < tie(b.x,b.y); });
        vector<long long> best(blocks.size()); long long answer = 0;
        for (size_t i = 0; i < blocks.size(); ++i) {
            best[i] = blocks[i].height;
            for (size_t j = 0; j < i; ++j)
                if (blocks[j].x < blocks[i].x && blocks[j].y < blocks[i].y)
                    best[i] = max(best[i],blocks[i].height + best[j]);
            answer = max(answer,best[i]);
        }
        cout << "Case " << ++tc << ": maximum height = " << answer << '\n';
    }
}
