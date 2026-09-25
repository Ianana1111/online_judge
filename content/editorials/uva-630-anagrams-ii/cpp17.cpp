#include <algorithm>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
string signature(string word){sort(word.begin(),word.end());return word;}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int tests;cin>>tests;
    for(int test=0;test<tests;++test){
        int n;cin>>n;vector<string> words(n),keys(n);for(int i=0;i<n;++i){cin>>words[i];keys[i]=signature(words[i]);}
        if(test)cout<<'\n';string query;
        while(cin>>query && query!="END"){
            string key=signature(query);vector<string> answer;
            for(int i=0;i<n;++i)if(keys[i]==key)answer.push_back(words[i]);
            cout<<"Anagrams for: "<<query<<'\n';
            if(answer.empty())cout<<"No anagrams for: "<<query<<'\n';
            else for(int i=0;i<(int)answer.size();++i)cout<<setw(3)<<i+1<<") "<<answer[i]<<'\n';
        }
    }
}
