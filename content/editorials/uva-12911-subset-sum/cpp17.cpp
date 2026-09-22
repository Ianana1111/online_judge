#include <bits/stdc++.h>
using namespace std;
vector<long long> sums(const vector<long long>& values,int begin,int end) {
    vector<long long> result;result.reserve(1<<(end-begin));result.push_back(0);
    for (int i=begin;i<end;++i) {
        int size=result.size();
        for (int j=0;j<size;++j) result.push_back(result[j]+values[i]);
    }
    sort(result.begin(),result.end());return result;
}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int n;long long target;
    while (cin >> n >> target) {
        vector<long long> values(n);for (auto &v:values) cin >> v;
        auto left=sums(values,0,n/2),right=sums(values,n/2,n);
        long long answer=0;int i=0,j=(int)right.size()-1;
        while (i<(int)left.size() && j>=0) {
            long long total=left[i]+right[j];
            if (total<target) { ++i;continue; }
            if (total>target) { --j;continue; }
            long long a=left[i],b=right[j],leftCount=0,rightCount=0;
            while (i<(int)left.size() && left[i]==a) { ++leftCount;++i; }
            while (j>=0 && right[j]==b) { ++rightCount;--j; }
            answer+=leftCount*rightCount;
        }
        if (target==0) --answer;
        cout << answer << '\n';
    }
}
