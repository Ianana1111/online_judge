#include <algorithm>
#include <iostream>
#include <string>
#include <unordered_set>
#include <vector>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int k,e,test=0;
    while(cin>>k>>e){
        unordered_set<string> keywords;string word,line;
        for(int i=0;i<k;++i){cin>>word;keywords.insert(word);}getline(cin,line);
        vector<string> excuses(e);vector<int> score(e);int best=0;
        for(int i=0;i<e;++i){
            getline(cin,excuses[i]);if(!excuses[i].empty()&&excuses[i].back()=='\r')excuses[i].pop_back();
            string token;
            auto finish=[&](){if(keywords.count(token))++score[i];token.clear();};
            for(unsigned char ch:excuses[i]){
                if(ch>='A'&&ch<='Z')token+=char(ch-'A'+'a');
                else if(ch>='a'&&ch<='z')token+=char(ch);
                else finish();
            }
            finish();best=max(best,score[i]);
        }
        cout<<"Excuse Set #"<<++test<<'\n';
        for(int i=0;i<e;++i)if(score[i]==best)cout<<excuses[i]<<'\n';
        cout<<'\n';
    }
}
