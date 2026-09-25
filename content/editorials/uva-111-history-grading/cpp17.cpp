#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    string line;int n=0;vector<int> correct;
    while(getline(cin,line)) {
        istringstream input(line);vector<int> ranking;int value;
        while(input>>value)ranking.push_back(value);
        if(ranking.empty())continue;
        if(ranking.size()==1){n=ranking[0];correct.clear();continue;}
        if(correct.empty()){correct=ranking;continue;}
        vector<int> sequence(n),dp(n,1);
        for(int event=0;event<n;++event)sequence[ranking[event]-1]=correct[event];
        int answer=1;
        for(int i=0;i<n;++i) {
            for(int j=0;j<i;++j)if(sequence[j]<sequence[i])dp[i]=max(dp[i],dp[j]+1);
            answer=max(answer,dp[i]);
        }
        cout<<answer<<'\n';
    }
}
