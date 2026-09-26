#include <iostream>
#include <sstream>
#include <string>
#include <set>
using namespace std;
string normalize(string s) {
    bool negative=s[0]=='-';size_t first=(s[0]=='-'||s[0]=='+');
    while(first+1<s.size()&&s[first]=='0')first++;
    string digits=s.substr(first);return negative&&digits!="0"?"-"+digits:digits;
}
set<string> parse(const string &line) {
    istringstream input(line);set<string> result;string token;
    while(input>>token)result.insert(normalize(token));return result;
}
int main() {
    string left,right;
    while(getline(cin,left)&&getline(cin,right)) {
        auto a=parse(left),b=parse(right);size_t common=0;
        for(const string &item:a)if(b.count(item))common++;
        if(common==a.size()&&common==b.size())cout<<"A equals B\n";
        else if(common==a.size())cout<<"A is a proper subset of B\n";
        else if(common==b.size())cout<<"B is a proper subset of A\n";
        else if(common==0)cout<<"A and B are disjoint\n";
        else cout<<"I'm confused!\n";
    }
}
