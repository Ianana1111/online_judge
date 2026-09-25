#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
const long long MOD=1000000007;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    string signature;
    while(cin >> signature) {
        vector<long long> previous(1,1);
        for(char relation:signature) {
            int k=previous.size();vector<long long> prefix(k+1),current(k+1);
            for(int j=0;j<k;++j)prefix[j+1]=(prefix[j]+previous[j])%MOD;
            for(int j=0;j<=k;++j) {
                if(relation=='I')current[j]=prefix[j];
                else if(relation=='D')current[j]=(prefix[k]-prefix[j]+MOD)%MOD;
                else current[j]=prefix[k];
            }
            previous.swap(current);
        }
        long long answer=0;for(long long count:previous)answer=(answer+count)%MOD;
        cout << answer << '\n';
    }
}
