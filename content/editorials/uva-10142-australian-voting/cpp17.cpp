#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);string line;getline(cin,line);int tests=stoi(line);
    for(int test=0;test<tests;++test){
        do{getline(cin,line);if(!line.empty()&&line.back()=='\r')line.pop_back();}while(line.empty());
        int n=stoi(line);vector<string> names(n);for(auto &name:names){getline(cin,name);if(!name.empty()&&name.back()=='\r')name.pop_back();}
        vector<vector<int>> ballots;
        while(getline(cin,line)){
            if(!line.empty()&&line.back()=='\r')line.pop_back();if(line.empty())break;
            istringstream in(line);vector<int> ballot;int id;while(in>>id)ballot.push_back(id-1);ballots.push_back(move(ballot));
        }
        vector<bool> alive(n,true);vector<int> winners;
        while(winners.empty()){
            vector<int> votes(n);
            for(auto &ballot:ballots)for(int id:ballot)if(alive[id]){++votes[id];break;}
            int least=INT_MAX,most=0;
            for(int i=0;i<n;++i)if(alive[i]){least=min(least,votes[i]);most=max(most,votes[i]);}
            if(2*most>(int)ballots.size()){
                for(int i=0;i<n;++i)if(alive[i]&&votes[i]==most)winners.push_back(i);
            }else if(least==most){for(int i=0;i<n;++i)if(alive[i])winners.push_back(i);}
            else for(int i=0;i<n;++i)if(alive[i]&&votes[i]==least)alive[i]=false;
        }
        if(test)cout<<'\n';for(int id:winners)cout<<names[id]<<'\n';
    }
}
