#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <map>
#include <numeric>
#include <tuple>
#include <unordered_map>
#include <vector>
using namespace std;
int W,H,area;uint32_t full;vector<array<int,3>> groups;vector<uint64_t> multiplier;
vector<vector<pair<uint32_t,int>>> anchors;
unordered_map<uint64_t,uint64_t> memo;
uint64_t solve(uint32_t occupied,uint64_t code){
 if(occupied==full)return code==0;
 uint64_t key=(code<<area)|occupied;
 auto it=memo.find(key);if(it!=memo.end())return it->second;
 int cell=__builtin_ctz(full^occupied);uint64_t result=0;
 for(auto [mask,index]:anchors[cell]){
  if((code/multiplier[index])%(groups[index][0]+1)==0||(mask&occupied))continue;
  result+=solve(occupied|mask,code-multiplier[index]);
 }
 memo[key]=result;return result;
}
uint64_t count_tiles(int w,int h,vector<array<int,3>> g){
 W=w;H=h;area=w*h;full=(1u<<area)-1;groups=g;multiplier.clear();uint64_t total=0,base=1;
 for(auto [count,a,b]:groups){multiplier.push_back(base);total+=count*base;base*=count+1;}
 anchors.assign(area,{});
 for(int index=0;index<(int)groups.size();++index){
  auto [count,a,b]=groups[index];vector<pair<int,int>> orientations={{a,b}};if(a!=b)orientations.push_back({b,a});
  for(auto [width,height]:orientations)for(int row=0;row+height<=H;++row)for(int col=0;col+width<=W;++col){
   uint32_t mask=0;for(int y=row;y<row+height;++y)for(int x=col;x<col+width;++x)mask|=1u<<(y*W+x);
   anchors[row*W+col].push_back({mask,index});
  }
 }
 memo.clear();return solve(0,total);
}
int main(){
 ios::sync_with_stdio(false);cin.tie(nullptr);int w,h,n;
 while(cin>>w>>h>>n){vector<array<int,3>> g(n);for(auto &row:g)cin>>row[0]>>row[1]>>row[2];cout<<count_tiles(w,h,g)<<'\n';}
}
