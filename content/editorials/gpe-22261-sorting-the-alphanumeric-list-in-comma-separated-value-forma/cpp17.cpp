#include <bits/stdc++.h>
using namespace std;
string trim(const string &value) {
    size_t first=value.find_first_not_of(' ');if(first==string::npos)return "";
    size_t last=value.find_last_not_of(' ');return value.substr(first,last-first+1);
}
struct Record { vector<string> key;string original;int index; };
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    string line;getline(cin,line);int t=stoi(line);
    for(int tc=0;tc<t;++tc) {
        while(getline(cin,line) && line.empty()){}
        vector<Record> rows;
        do {
            Record record;record.original=line;record.index=rows.size();size_t start=0;
            while(true) {
                size_t end=line.find(',',start);if(end==string::npos)end=line.size();
                record.key.push_back(trim(line.substr(start,end-start)));
                if(end==line.size())break;start=end+1;
            }
            rows.push_back(move(record));
        } while(getline(cin,line) && !line.empty());
        sort(rows.begin(),rows.end(),[](const Record &a,const Record &b) {
            if(a.key!=b.key)return a.key<b.key;
            return a.index<b.index;
        });
        if(tc)cout << '\n';
        for(const Record &record:rows)cout << record.original << '\n';
    }
}
