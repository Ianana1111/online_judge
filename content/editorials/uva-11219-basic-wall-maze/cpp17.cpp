#include <iostream>
#include <tuple>
#include <utility>
using namespace std;
tuple<int,int,int> readDate() {
    int day,month,year;char slash;cin>>day>>slash>>month>>slash>>year;
    return {year,month,day};
}
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    for(int tc=1;tc<=t;++tc) {
        auto current=readDate(),birth=readDate();
        cout<<"Case #"<<tc<<": ";
        if(birth>current){cout<<"Invalid birth date\n";continue;}
        auto [cy,cm,cd]=current;auto [by,bm,bd]=birth;
        int age=cy-by;
        if(make_pair(cm,cd)<make_pair(bm,bd))--age;
        if(age>130)cout<<"Check birth date\n";
        else cout<<age<<'\n';
    }
}
