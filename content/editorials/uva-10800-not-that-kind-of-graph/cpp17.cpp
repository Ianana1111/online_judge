#include <algorithm>
#include <iostream>
#include <map>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    for(int tc=1;tc<=t;++tc) {
        string s;cin >> s;int n=s.size(),height=0;map<int,string> rows;
        for(int x=0;x<n;++x) {
            char ch=s[x];if(ch=='F')--height;
            if(!rows.count(height))rows[height]=string(n,' ');
            rows[height][x]=(ch=='R'?'/':ch=='F'?'\\':'_');
            if(ch=='R')++height;
        }
        cout << "Case #" << tc << ":\n";
        for(int y=rows.rbegin()->first;y>=rows.begin()->first;--y) {
            string row=rows.count(y)?rows[y]:string(n,' ');
            while(!row.empty() && row.back()==' ')row.pop_back();
            cout << "| " << row << '\n';
        }
        cout << '+' << string(n+2,'-') << "\n\n";
    }
}
