#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    while(t--) {
        int n;cin >> n;vector<unsigned long long> values(n);for(auto &v:values)cin >> v;
        vector<int> up(n,1);
        for(int i=n-1;i>=0;--i)for(int j=i+1;j<n;++j)if(values[j]>values[i])up[i]=max(up[i],1+up[j]);
        int length=*max_element(up.begin(),up.end());vector<vector<unsigned long long>> answers;vector<unsigned long long> path;
        function<void(int,int)> visit=[&](int start,int remaining) {
            if(remaining==0){answers.push_back(path);return;}
            for(int i=start;i<n;++i)if(up[i]==remaining && (path.empty() || values[i]>path.back())) {
                path.push_back(values[i]);visit(i+1,remaining-1);path.pop_back();
            }
        };
        visit(0,length);
        cout << answers.size() << '\n';
        for(const auto &sequence:answers){for(size_t i=0;i<sequence.size();++i){if(i)cout << ' ';cout << sequence[i];}cout << '\n';}
    }
}
