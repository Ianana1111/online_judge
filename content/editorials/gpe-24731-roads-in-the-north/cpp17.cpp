#include <algorithm>
#include <iostream>
#include <map>
#include <sstream>
#include <string>
#include <tuple>
#include <utility>
#include <vector>
using namespace std;

class Decimal {
    string digits;
public:
    Decimal(long long value=0):digits(to_string(value)){}
    explicit Decimal(string value):digits(move(value)){}
    friend bool operator>(const Decimal& a,const Decimal& b){return a.digits.size()!=b.digits.size()?a.digits.size()>b.digits.size():a.digits>b.digits;}
    friend Decimal operator+(const Decimal& a,const Decimal& b){string answer;int carry=0;size_t i=a.digits.size(),j=b.digits.size();while(i||j||carry){int sum=carry;if(i)sum+=a.digits[--i]-'0';if(j)sum+=b.digits[--j]-'0';answer.push_back(char('0'+sum%10));carry=sum/10;}reverse(answer.begin(),answer.end());return Decimal(move(answer));}
    friend istream& operator>>(istream& in,Decimal& value){string s;if(in>>s){if(!s.empty()&&s[0]=='+')s.erase(0,1);size_t first=s.find_first_not_of('0');value.digits=first==string::npos?"0":s.substr(first);}return in;}
    friend ostream& operator<<(ostream& out,const Decimal& value){return out<<value.digits;}
};
using Graph = map<int, vector<pair<int,Decimal>>>;
pair<int,Decimal> farthest(const Graph& graph, int start) {
    vector<tuple<int,int,Decimal>> pending{{start, -1, 0}}; pair<int,Decimal> best{start,0};
    while (!pending.empty()) {
        auto [u, parent, distance] = pending.back(); pending.pop_back();
        if (distance > best.second) best = {u,distance};
        for (auto [v, length] : graph.at(u)) if (v != parent) pending.emplace_back(v,u,distance+length);
    }
    return best;
}
int main() {
    ios::sync_with_stdio(false); cin.tie(nullptr);
    Graph graph;
    auto solve = [&]() {
        if (graph.empty()) return;
        auto endpoint = farthest(graph, graph.begin()->first);
        cout << farthest(graph, endpoint.first).second << '\n'; graph.clear();
    };
    string line;
    while (getline(cin,line)) {
        stringstream input(line); int a,b; Decimal length;
        if (!(input >> a >> b >> length)) { solve(); continue; }
        graph[a].push_back({b,length}); graph[b].push_back({a,length});
    }
    solve();
}
