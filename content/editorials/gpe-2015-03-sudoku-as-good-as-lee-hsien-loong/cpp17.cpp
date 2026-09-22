#include <bits/stdc++.h>
using namespace std;
int main() {
    ios::sync_with_stdio(false);cin.tie(nullptr);
    int t;cin >> t;
    while(t--) {
        array<int,81> grid{};array<int,9> row{},column{},box{};vector<int> empty;bool valid=true;
        for(int cell=0;cell<81;++cell) {
            int value;cin >> value;grid[cell]=value;
            int r=cell/9,c=cell%9,b=r/3*3+c/3;
            if(value!=0) {
                int bit=1<<(value-1);
                if((row[r]|column[c]|box[b])&bit)valid=false;
                row[r]|=bit;column[c]|=bit;box[b]|=bit;
            } else empty.push_back(cell);
        }
        function<bool(int)> search=[&](int at) {
            if(at==(int)empty.size())return true;
            int pick=at,options=0,minimum=10;
            for(int i=at;i<(int)empty.size();++i) {
                int cell=empty[i],r=cell/9,c=cell%9,b=r/3*3+c/3;
                int mask=511&~(row[r]|column[c]|box[b]);int count=__builtin_popcount((unsigned)mask);
                if(count<minimum){minimum=count;options=mask;pick=i;}
                if(minimum==0)break;
            }
            if(minimum==0)return false;
            swap(empty[at],empty[pick]);int cell=empty[at],r=cell/9,c=cell%9,b=r/3*3+c/3;
            while(options) {
                int bit=options&-options;options-=bit;grid[cell]=__builtin_ctz((unsigned)bit)+1;
                row[r]|=bit;column[c]|=bit;box[b]|=bit;
                if(search(at+1))return true;
                row[r]&=~bit;column[c]&=~bit;box[b]&=~bit;grid[cell]=0;
            }
            swap(empty[at],empty[pick]);return false;
        };
        if(!valid || !search(0)){cout << "NO\n";continue;}
        for(int r=0;r<9;++r){for(int c=0;c<9;++c){if(c)cout << ' ';cout << grid[r*9+c];}cout << '\n';}
    }
}
