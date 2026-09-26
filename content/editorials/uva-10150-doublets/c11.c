#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef unsigned __int128 Key;
typedef struct {Key key;int word;} Pattern;
char words[25143][17];Pattern patterns[402288];int buckets[25143][16],degree[25143],ending[402288],seen[402288],previous[25143],queue[25143],n,total;
int pattern_compare(const void *a,const void *b){Key x=((const Pattern*)a)->key,y=((const Pattern*)b)->key;return(x>y)-(x<y);}
int word_compare(const void *a,const void *b){return strcmp((const char*)a,(const char*)b);}
int id(char *word){int l=0,r=n;while(l<r){int m=(l+r)/2;if(strcmp(words[m],word)<0)l=m+1;else r=m;}return l<n&&strcmp(words[l],word)==0?l:-1;}
int main(void){char line[40];while(fgets(line,sizeof(line),stdin)){line[strcspn(line,"\r\n")]='\0';if(!*line)break;strcpy(words[n++],line);}qsort(words,n,sizeof(words[0]),word_compare);int unique=0;for(int i=0;i<n;i++)if(!unique||strcmp(words[i],words[unique-1])){if(unique!=i)strcpy(words[unique],words[i]);unique++;}n=unique;
    for(int u=0;u<n;u++){int length=(int)strlen(words[u]);Key code=(Key)length<<80;for(int k=0;k<length;k++)code|=(Key)(words[u][k]-'a'+1)<<(5*k);for(int k=0;k<length;k++)patterns[total++]=(Pattern){code&~((Key)31<<(5*k)),u};}qsort(patterns,total,sizeof(Pattern),pattern_compare);
    for(int begin=0;begin<total;){int end=begin+1;while(end<total&&patterns[end].key==patterns[begin].key)end++;ending[begin]=end;for(int at=begin;at<end;at++){int u=patterns[at].word;buckets[u][degree[u]++]=begin;}begin=end;}
    char a[17],b[17];int query=0;while(scanf("%16s%16s",a,b)==2){if(query)putchar('\n');query++;int start=id(a),finish=id(b);if(start<0||finish<0||strlen(a)!=strlen(b)){puts("No solution.");continue;}for(int u=0;u<n;u++)previous[u]=-1;int front=0,back=1;queue[0]=start;previous[start]=start;
        while(front<back&&previous[finish]<0){int u=queue[front++];for(int i=0;i<degree[u];i++){int begin=buckets[u][i];if(seen[begin]==query)continue;seen[begin]=query;for(int at=begin;at<ending[begin];at++){int v=patterns[at].word;if(previous[v]<0){previous[v]=u;queue[back++]=v;}}}}
        if(previous[finish]<0){puts("No solution.");continue;}int count=0;for(int u=finish;;u=previous[u]){queue[count++]=u;if(u==start)break;}while(count)puts(words[queue[--count]]);
    }return 0;
}
