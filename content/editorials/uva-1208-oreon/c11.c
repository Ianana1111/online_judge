#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *word(void) {
    int c;do{c=getchar();}while(c!=EOF&&(c<=32||c==','));if(c==EOF)return NULL;
    size_t n=0,capacity=32;char *s=(char*)malloc(capacity);
    while(c!=EOF&&c>32&&c!=','){if(n+1==capacity){capacity*=2;s=(char*)realloc(s,capacity);}s[n++]=(char)c;c=getchar();}
    s[n]='\0';return s;
}
char *normalize(char *s){char *first=s+(*s=='+');while(first[0]=='0'&&first[1])first++;memmove(s,first,strlen(first)+1);return s;}

typedef struct {int a,b;char *weight;} Edge;
int parent[26];
int find(int a){while(parent[a]!=a){parent[a]=parent[parent[a]];a=parent[a];}return a;}
int compare(const void *left,const void *right){
    const Edge *a=(const Edge*)left,*b=(const Edge*)right;size_t x=strlen(a->weight),y=strlen(b->weight);
    if(x!=y)return x<y?-1:1;int order=strcmp(a->weight,b->weight);
    if(order)return order;if(a->a!=b->a)return a->a-b->a;return a->b-b->b;
}
int main(void){
    char *s=word();if(!s)return 0;int tests=atoi(s);free(s);
    for(int test=1;test<=tests;test++){
        s=word();int n=atoi(s);free(s);Edge edges[325];int count=0;
        for(int a=0;a<n;a++)for(int b=0;b<n;b++){
            char *weight=normalize(word());
            if(a<b&&strcmp(weight,"0"))edges[count++]=(Edge){a,b,weight};else free(weight);
        }
        qsort(edges,count,sizeof(Edge),compare);for(int i=0;i<n;i++)parent[i]=i;
        printf("Case %d:\n",test);int chosen=0;
        for(int i=0;i<count;i++){
            Edge e=edges[i];int a=find(e.a),b=find(e.b);
            if(a!=b&&chosen<n-1){parent[a]=b;chosen++;printf("%c-%c %s\n",'A'+e.a,'A'+e.b,e.weight);}
            free(e.weight);
        }
    }
    return 0;
}
