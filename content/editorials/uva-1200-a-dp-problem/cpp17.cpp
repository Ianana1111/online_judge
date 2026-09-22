#include <bits/stdc++.h>
using namespace std;
pair<long long,long long> parse(const string &s) {
    long long coefficient=0,constant=0;int i=0;
    while (i<(int)s.size()) {
        int sign=1;
        if (s[i]=='+' || s[i]=='-') { if (s[i]=='-') sign=-1;++i; }
        long long value=0;bool hasDigits=false;
        while (i<(int)s.size() && isdigit((unsigned char)s[i])) { hasDigits=true;value=value*10+s[i]-'0';++i; }
        if (i<(int)s.size() && s[i]=='x') { coefficient+=sign*(hasDigits?value:1);++i; }
        else constant+=sign*value;
    }
    return {coefficient,constant};
}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    while (t--) {
        string equation;cin >> equation;int equal=equation.find('=');
        auto [a,b]=parse(equation.substr(0,equal));auto [c,d]=parse(equation.substr(equal+1));
        long long numerator=d-b,denominator=a-c;
        if (denominator==0) { cout << (numerator==0?"IDENTITY":"IMPOSSIBLE") << '\n';continue; }
        if (denominator<0) { denominator=-denominator;numerator=-numerator; }
        long long answer=numerator/denominator;
        if (numerator<0 && numerator%denominator!=0) --answer;
        cout << answer << '\n';
    }
}
