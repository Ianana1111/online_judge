#include <algorithm>
#include <iostream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    int t; cin >> t;
    for (int tc=1;tc<=t;++tc) {
        string digits; cin >> digits;
        int count[3]={},residue=0;
        for (char ch:digits) { int r=(ch-'0')%3; ++count[r]; residue=(residue+r)%3; }
        bool wins=false;
        if (count[residue]>0) {
            int remaining=count[0]-(residue==0);
            wins=(remaining%2==0);
        }
        cout << "Case " << tc << ": " << (wins?'S':'T') << '\n';
    }
}
