#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    string line;getline(cin,line);int t=stoi(line);
    for(int tc=0;tc<t;++tc) {
        string plain,sub;
        while(getline(cin,plain) && plain.empty()){}
        getline(cin,sub);
        array<unsigned char,256> mapping;
        for(int c=0;c<256;++c)mapping[c]=c;
        for(size_t i=0;i<plain.size();++i)mapping[(unsigned char)plain[i]]=(unsigned char)sub[i];
        if(tc)cout << '\n';cout << sub << '\n' << plain << '\n';
        while(getline(cin,line) && !line.empty()) {
            for(unsigned char ch:line)cout << mapping[ch];
            cout << '\n';
        }
    }
}
