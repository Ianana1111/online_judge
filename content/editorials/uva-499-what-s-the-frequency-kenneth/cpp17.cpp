#include <algorithm>
#include <iostream>
#include <string>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    string line,alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    while(getline(cin,line)){
        int count[128]={},best=0;
        for(unsigned char ch:line)if((ch>='A'&&ch<='Z')||(ch>='a'&&ch<='z'))best=max(best,++count[ch]);
        for(char ch:alphabet)if(count[(int)ch]==best && best>0)cout<<ch;
        cout<<' '<<best<<'\n';
    }
}
