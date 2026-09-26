#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

char *readLine(void) {
    size_t used=0,capacity=64;char *s=(char*)malloc(capacity);int c;
    while((c=getchar())!=EOF&&c!='\n') {
        if(used+1==capacity){capacity*=2;s=(char*)realloc(s,capacity);}
        s[used++]=(char)c;
    }
    if(c==EOF&&used==0){free(s);return NULL;}
    s[used]='\0';return s;
}

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}
char *normalize(char *text){size_t first=0;while(text[first]=='0'&&text[first+1])first++;if(first)memmove(text,text+first,strlen(text+first)+1);return text;}
char *add(const char *a,const char *b){
    size_t x=strlen(a),y=strlen(b),size=(x>y?x:y)+1;
    char *result=(char*)malloc(size+1);result[size]='\0';int carry=0;
    for(size_t i=0;i<size;i++){int value=carry+(i<x?a[x-1-i]-'0':0)+(i<y?b[y-1-i]-'0':0);result[size-1-i]=(char)('0'+value%10);carry=value/10;}
    return normalize(result);
}

int compare(const char *a,const char *b){size_t x=strlen(a),y=strlen(b);if(x!=y)return x>y?1:-1;int sign=strcmp(a,b);return (sign>0)-(sign<0);}
typedef struct {int a,b;char *length;} Road;
typedef struct {int to,next;char *length;} Edge;
typedef struct {int node,parent;char *distance;} State;
Road roads[10000];Edge edges[20000];int names[20000],head[10000],road_count,node_count;
int integer_compare(const void *a,const void *b){int x=*(const int*)a,y=*(const int*)b;return(x>y)-(x<y);}
int id(int name){int l=0,r=node_count;while(l<r){int m=(l+r)/2;if(names[m]<name)l=m+1;else r=m;}return l;}
int farthest(int start,char **result){State pending[10000];int size=1,best=start;char *maximum=copy("0");pending[0]=(State){start,-1,copy("0")};while(size){State s=pending[--size];if(compare(s.distance,maximum)>0){free(maximum);maximum=copy(s.distance);best=s.node;}for(int e=head[s.node];e!=-1;e=edges[e].next)if(edges[e].to!=s.parent)pending[size++]=(State){edges[e].to,s.node,add(s.distance,edges[e].length)};free(s.distance);}*result=maximum;return best;}
void solve(void){if(!road_count)return;int entries=2*road_count;for(int i=0;i<road_count;i++){names[2*i]=roads[i].a;names[2*i+1]=roads[i].b;}qsort(names,entries,sizeof(int),integer_compare);node_count=0;for(int i=0;i<entries;i++)if(!node_count||names[i]!=names[node_count-1])names[node_count++]=names[i];for(int i=0;i<node_count;i++)head[i]=-1;int count=0;for(int i=0;i<road_count;i++){int a=id(roads[i].a),b=id(roads[i].b);edges[count]=(Edge){b,head[a],roads[i].length};head[a]=count++;edges[count]=(Edge){a,head[b],roads[i].length};head[b]=count++;}char *distance;int endpoint=farthest(0,&distance);free(distance);farthest(endpoint,&distance);puts(distance);free(distance);for(int i=0;i<road_count;i++)free(roads[i].length);road_count=0;}
int main(void){char *line;while((line=readLine())!=NULL){char *a=strtok(line," \t\r"),*b=a?strtok(NULL," \t\r"):NULL,*length=b?strtok(NULL," \t\r"):NULL;if(!length)solve();else roads[road_count++]=(Road){atoi(a),atoi(b),normalize(copy(length+(*length=='+')))};free(line);}solve();return 0;}
