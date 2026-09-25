#include <algorithm>
#include <cmath>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <utility>
#include <vector>
using namespace std;
void accumulate(double value,double &sum,double &compensation){
    double corrected=value-compensation,next=sum+corrected;
    compensation=(next-sum)-corrected;sum=next;
}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);vector<pair<int,int>> queries;int n;
    while(cin>>n)queries.push_back({n,(int)queries.size()});
    vector<pair<double,long long>> answer(queries.size());sort(queries.begin(),queries.end());
    int step=0;double logSurvival=0,logFactorial=0,survivalError=0,factorialError=0;
    for(auto [target,index]:queries){
        while(step<target){
            ++step;double k=step;
            accumulate(log1p(-1/(k*(k+1))),logSurvival,survivalError);
            accumulate(log10(k),logFactorial,factorialError);
        }
        double probability=target==0?0:-expm1(logSurvival);
        long long zeroes=target==0?0:(long long)floor(2*logFactorial+log10((double)target+1));
        answer[index]={probability,zeroes};
    }
    for(auto [probability,zeroes]:answer)cout<<fixed<<setprecision(6)<<probability<<' '<<zeroes<<'\n';
}
