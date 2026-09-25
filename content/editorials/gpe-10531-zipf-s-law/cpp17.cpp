#include <algorithm>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    string line;bool first=true;
    while(getline(cin,line)) {
        string frequency;stringstream header(line);if(!(header>>frequency))continue;
        int target=0;for(char ch:frequency)target=min(10001,target*10+ch-'0');
        map<string,int> count;
        while(getline(cin,line) && line!="EndOfText") {
            string word;
            auto finish=[&]() { if(!word.empty()){++count[word];word.clear();} };
            for(char ch:line) {
                bool letter=(ch>='a' && ch<='z') || (ch>='A' && ch<='Z');
                if(letter) {
                    if(ch>='A' && ch<='Z')ch=char(ch-'A'+'a');
                    word.push_back(ch);
                } else finish();
            }
            finish();
        }
        if(!first)cout << '\n';first=false;bool found=false;
        for(const auto &[word,times]:count)if(times==target){cout << word << '\n';found=true;}
        if(!found)cout << "There is no such word.\n";
    }
}
