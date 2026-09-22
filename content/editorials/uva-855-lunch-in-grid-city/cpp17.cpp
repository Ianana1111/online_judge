#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    while(t--) {
        int s,a,f;cin >> s >> a >> f;vector<int> streets(f),avenues(f);
        for(int i=0;i<f;++i)cin >> streets[i] >> avenues[i];
        sort(streets.begin(),streets.end());sort(avenues.begin(),avenues.end());
        int index=(f-1)/2;
        cout << "(Street: " << streets[index] << ", Avenue: " << avenues[index] << ")\n";
    }
}
