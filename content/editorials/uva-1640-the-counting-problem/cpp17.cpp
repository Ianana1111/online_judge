#include <algorithm>
#include <array>
#include <iostream>
using namespace std;
array<long long,10> prefix(long long n) {
    array<long long,10> answer{};
    for(long long factor=1;factor<=n;factor*=10) {
        long long higher=n/(factor*10),digit=n/factor%10,lower=n%factor;
        for(int d=1;d<=9;++d) {
            answer[d]+=higher*factor;
            if(digit>d)answer[d]+=factor;
            else if(digit==d)answer[d]+=lower+1;
        }
        if(higher>0)answer[0]+=(higher-1)*factor+(digit==0?lower+1:factor);
    }
    return answer;
}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    long long a,b;
    while(cin >> a >> b && (a || b)) {
        if(a>b)swap(a,b);
        auto before=prefix(a-1),after=prefix(b);
        for(int d=0;d<=9;++d){if(d)cout << ' ';cout << after[d]-before[d];}
        cout << '\n';
    }
}
