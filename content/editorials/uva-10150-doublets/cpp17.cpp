#include <algorithm>
#include <deque>
#include <iostream>
#include <queue>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;
using Key=unsigned __int128;
struct Pattern{Key key;int word;};
int main(){
    ios::sync_with_stdio(false);cin.tie(nullptr);vector<string> words;unordered_map<string,int> ids;string line;
    while(getline(cin,line)){
        if(!line.empty()&&line.back()=='\r')line.pop_back();if(line.empty())break;
        if(!ids.count(line)){ids[line]=words.size();words.push_back(line);}
    }
    vector<Key> power(16,1);for(int i=1;i<16;++i)power[i]=power[i-1]*27;
    vector<Pattern> patterns;patterns.reserve(words.size()*16);
    for(int id=0;id<(int)words.size();++id){
        const auto &word=words[id];Key code=0;for(int k=0;k<(int)word.size();++k)code+=Key(word[k]-'a'+1)*power[k];
        for(int k=0;k<(int)word.size();++k)patterns.push_back({(code-Key(word[k]-'a'+1)*power[k])*32+word.size(),id});
    }
    sort(patterns.begin(),patterns.end(),[](const auto &a,const auto &b){return a.key!=b.key?a.key<b.key:a.word<b.word;});
    vector<vector<int>> buckets(words.size());for(int id=0;id<(int)words.size();++id)buckets[id].reserve(words[id].size());
    vector<int> ending(patterns.size()),seen(patterns.size(),-1);
    for(int begin=0;begin<(int)patterns.size();){
        int end=begin+1;while(end<(int)patterns.size()&&patterns[end].key==patterns[begin].key)++end;
        ending[begin]=end;for(int i=begin;i<end;++i)buckets[patterns[i].word].push_back(begin);begin=end;
    }
    string startWord,endWord;int query=0;
    while(cin>>startWord>>endWord){
        if(query)cout<<'\n';++query;
        if(!ids.count(startWord)||!ids.count(endWord)||startWord.size()!=endWord.size()){cout<<"No solution.\n";continue;}
        int start=ids[startWord],finish=ids[endWord];vector<int> previous(words.size(),-1);previous[start]=start;deque<int> queue{start};
        while(!queue.empty()&&previous[finish]<0){
            int u=queue.front();queue.pop_front();
            for(int bucket:buckets[u]){
                if(seen[bucket]==query)continue;seen[bucket]=query;
                for(int at=bucket;at<ending[bucket];++at){
                    int v=patterns[at].word;if(previous[v]>=0)continue;
                    previous[v]=u;queue.push_back(v);
                }
            }
        }
        if(previous[finish]<0){cout<<"No solution.\n";continue;}
        vector<int> answer;for(int u=finish;;u=previous[u]){answer.push_back(u);if(u==start)break;}
        reverse(answer.begin(),answer.end());for(int id:answer)cout<<words[id]<<'\n';
    }
}
