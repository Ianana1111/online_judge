#include <algorithm>
#include <iomanip>
#include <iostream>
#include <utility>
#include <vector>
using namespace std;
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int tests;cin>>tests;
    for(int test=0;test<tests;++test){
        int target,a,b;cin>>target;vector<pair<int,int>> segments,answer;
        while(cin>>a>>b && (a||b))segments.push_back({a,b});
        sort(segments.begin(),segments.end());int covered=0,at=0;
        while(covered<target){
            int farthest=covered,chosen=-1;
            while(at<(int)segments.size()&&segments[at].first<=covered){
                if(segments[at].second>farthest){farthest=segments[at].second;chosen=at;}
                ++at;
            }
            if(chosen<0){answer.clear();break;}
            answer.push_back(segments[chosen]);covered=farthest;
        }
        if(test)cout<<'\n';cout<<answer.size()<<'\n';
        for(auto [left,right]:answer)cout<<left<<' '<<right<<'\n';
    }
}
