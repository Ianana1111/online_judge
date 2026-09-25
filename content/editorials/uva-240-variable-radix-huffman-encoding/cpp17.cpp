#include <algorithm>
#include <climits>
#include <functional>
#include <iostream>
#include <queue>
#include <set>
#include <string>
#include <utility>
#include <vector>
using namespace std;
struct Node{int weight,letter;vector<int> children;};
struct Item{int weight,letter,id;bool operator>(const Item &other)const{
    if(weight!=other.weight)return weight>other.weight;
    return letter>other.letter;
}};
string fixed_ratio(long long numerator,long long denominator){
    long long value=(2*numerator*100+denominator)/(2*denominator);
    return to_string(value/100)+"."+(value%100<10?"0":"")+to_string(value%100);
}
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);int radix,n,set=0;
    while(cin>>radix && radix){
        cin>>n;vector<int> frequency(n);vector<Node> nodes;
        priority_queue<Item,vector<Item>,greater<Item>> queue;
        auto add=[&](int weight,int letter,vector<int> children){
            int id=nodes.size();nodes.push_back({weight,letter,move(children)});queue.push({weight,letter,id});
        };
        for(int i=0;i<n;++i){cin>>frequency[i];add(frequency[i],i,{});}
        int dummy=26;
        while((int)queue.size()<radix || ((int)queue.size()-1)%(radix-1)!=0)add(0,dummy++,{});
        while(queue.size()>1){
            int weight=0,letter=INT_MAX;vector<int> children;
            for(int i=0;i<radix;++i){auto item=queue.top();queue.pop();weight+=item.weight;letter=min(letter,item.letter);children.push_back(item.id);}
            add(weight,letter,move(children));
        }
        vector<string> codes(n);
        function<void(int,string)> visit=[&](int id,string prefix){
            const auto &node=nodes[id];
            if(node.children.empty()){if(node.letter<n)codes[node.letter]=prefix;return;}
            for(int digit=0;digit<radix;++digit)visit(node.children[digit],prefix+char('0'+digit));
        };
        visit(queue.top().id,"");long long weighted=0,total=0;
        for(int i=0;i<n;++i){weighted+=frequency[i]*codes[i].size();total+=frequency[i];}
        cout<<"Set "<<++set<<"; average length "<<fixed_ratio(weighted,total)<<'\n';
        for(int i=0;i<n;++i)cout<<"    "<<char('A'+i)<<": "<<codes[i]<<'\n';
        cout<<'\n';
    }
}
