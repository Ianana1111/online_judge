#include <algorithm>
#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int rows,cols,caseNo=0;
    while(cin>>rows>>cols&&(rows||cols)) {
        vector<pair<int,int>> position(rows*cols);
        for(int r=1;r<=rows;++r)for(int c=1;c<=cols;++c)position[(r-1)*cols+c-1]={r,c};
        int operations;cin>>operations;
        while(operations--) {
            string command;cin>>command;
            if(command=="EX") {
                pair<int,int> a,b;cin>>a.first>>a.second>>b.first>>b.second;
                for(auto& current:position){if(current==a)current=b;else if(current==b)current=a;}
            } else {
                int k;cin>>k;vector<int> indices(k);for(int& index:indices)cin>>index;
                bool insert=command[0]=='I',row=command[1]=='R';
                for(auto& current:position) {
                    if(current.first<0)continue;
                    int before=row?current.first:current.second;
                    if(!insert&&find(indices.begin(),indices.end(),before)!=indices.end()){current={-1,-1};continue;}
                    int shift=0;
                    for(int index:indices)if(insert?index<=before:index<before)shift+=insert?1:-1;
                    if(row)current.first+=shift;else current.second+=shift;
                }
            }
        }
        if(caseNo)cout<<'\n';cout<<"Spreadsheet #"<<++caseNo<<'\n';
        int queries;cin>>queries;
        while(queries--) {
            int r,c;cin>>r>>c;auto [nowR,nowC]=position[(r-1)*cols+c-1];
            cout<<"Cell data in ("<<r<<','<<c<<")";
            if(nowR<0)cout<<" GONE\n";
            else cout<<" moved to ("<<nowR<<','<<nowC<<")\n";
        }
    }
}
