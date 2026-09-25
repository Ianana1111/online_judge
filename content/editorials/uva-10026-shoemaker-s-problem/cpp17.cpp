#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;
struct Job { long long time, fine; int id; };
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int tests; cin >> tests;
    for (int tc = 0; tc < tests; ++tc) {
        int n; cin >> n; vector<Job> jobs(n);
        for (int i = 0; i < n; ++i) { cin >> jobs[i].time >> jobs[i].fine; jobs[i].id = i + 1; }
        sort(jobs.begin(), jobs.end(), [](const Job &a, const Job &b) {
            long long ab = a.time * b.fine, ba = b.time * a.fine;
            if (ab != ba) return ab < ba;
            return a.id < b.id;
        });
        if (tc) cout << '\n';
        for (int i = 0; i < n; ++i) { if (i) cout << ' '; cout << jobs[i].id; }
        cout << '\n';
    }
}
