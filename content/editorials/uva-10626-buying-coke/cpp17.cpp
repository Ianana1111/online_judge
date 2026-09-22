#include <bits/stdc++.h>
using namespace std;
int totalC,totalValue,maxFive,maxTen;
vector<int> memo;
int solve(int remaining,int fives,int tens){
    if(remaining==0)return 0;
    int index=(remaining*(maxFive+1)+fives)*(maxTen+1)+tens;
    int &answer=memo[index];if(answer!=-1)return answer;
    int ones=totalValue-8*(totalC-remaining)-5*fives-10*tens;
    answer=1000000;
    if(ones>=8)answer=min(answer,8+solve(remaining-1,fives,tens));
    if(fives>=1&&ones>=3)answer=min(answer,4+solve(remaining-1,fives-1,tens));
    if(fives>=2)answer=min(answer,2+solve(remaining-1,fives-2,tens));
    if(tens>=1)answer=min(answer,1+solve(remaining-1,fives,tens-1));
    if(tens>=1&&ones>=3)answer=min(answer,4+solve(remaining-1,fives+1,tens-1));
    return answer;
}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin>>t;
    while(t--){
        int ones,fives,tens;cin>>totalC>>ones>>fives>>tens;
        totalValue=ones+5*fives+10*tens;maxFive=fives+tens;maxTen=tens;
        memo.assign((totalC+1)*(maxFive+1)*(maxTen+1),-1);
        cout<<solve(totalC,fives,tens)<<'\n';
    }
}
