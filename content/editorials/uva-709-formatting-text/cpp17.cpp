#include <bits/stdc++.h>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);string line;
    while(getline(cin,line)){
        if(!line.empty()&&line.back()=='\r')line.pop_back();if(line.empty())continue;
        int width=stoi(line);if(width==0)break;vector<string> words;
        while(getline(cin,line)){
            if(!line.empty()&&line.back()=='\r')line.pop_back();if(line.empty())break;
            istringstream input(line);string word;while(input>>word)words.push_back(word);
        }
        int n=words.size();vector<int> cost(n+1),next(n);vector<vector<unsigned char>> sequence(n+1);
        for(int i=n-1;i>=0;--i){
            int letters=0,best=INT_MAX,chosen=-1,bestQ=0,bestR=0;
            for(int j=i;j<n;++j){
                letters+=words[j].size();int gaps=j-i;if(letters+gaps>width)break;
                int q=0,r=0,local;
                if(gaps==0)local=letters==width?0:500;
                else{q=(width-letters)/gaps;r=(width-letters)%gaps;local=(gaps-r)*(q-1)*(q-1)+r*q*q;}
                int total=local+cost[j+1];bool better=total<best;
                if(total==best){
                    int oldGaps=chosen-i,length=gaps+sequence[j+1].size(),oldLength=oldGaps+sequence[chosen+1].size();
                    int at=0;
                    for(;at<min(length,oldLength);++at){
                        int a=at<gaps?q+(at>=gaps-r):sequence[j+1][at-gaps];
                        int b=at<oldGaps?bestQ+(at>=oldGaps-bestR):sequence[chosen+1][at-oldGaps];
                        if(a!=b){better=a<b;break;}
                    }
                    if(at==min(length,oldLength))better=length>oldLength;
                }
                if(better){best=total;chosen=j;bestQ=q;bestR=r;}
            }
            cost[i]=best;next[i]=chosen+1;int gaps=chosen-i;
            sequence[i].reserve(gaps+sequence[chosen+1].size());
            for(int k=0;k<gaps;++k)sequence[i].push_back(bestQ+(k>=gaps-bestR));
            sequence[i].insert(sequence[i].end(),sequence[chosen+1].begin(),sequence[chosen+1].end());
        }
        for(int i=0;i<n;i=next[i]){
            int end=next[i],gaps=end-i-1,letters=0;for(int j=i;j<end;++j)letters+=words[j].size();
            int q=gaps?(width-letters)/gaps:0,r=gaps?(width-letters)%gaps:0;
            for(int j=i;j<end;++j){if(j>i)cout<<string(q+(j-i-1>=gaps-r),' ');cout<<words[j];}cout<<'\n';
        }
        cout<<'\n';
    }
}
