#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    while(t--) {
        string s;cin >> s;int n=s.size(),i=0,j=1,k=0;
        while(i<n && j<n && k<n) {
            char a=s[(i+k)%n],b=s[(j+k)%n];
            if(a==b){++k;continue;}
            if(a>b){i+=k+1;if(i==j)++i;}
            else {j+=k+1;if(i==j)++j;}
            k=0;
        }
        cout << min(i,j)+1 << '\n';
    }
}
