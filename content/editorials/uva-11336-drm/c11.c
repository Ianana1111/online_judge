#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
char *word(void){
    int c;do{c=getchar();}while(c!=EOF&&isspace((unsigned char)c));
    if(c==EOF)return NULL;
    size_t size=0,capacity=32;char *text=(char*)malloc(capacity);
    do{if(size+1==capacity){capacity*=2;text=(char*)realloc(text,capacity);}text[size++]=(char)c;c=getchar();}while(c!=EOF&&!isspace((unsigned char)c));
    text[size]='\0';return text;
}

typedef struct {char *a,*b;int u,v;} Edge;
typedef struct {int a,b;} Pair;
Edge *read_map(int *count){int capacity=16;Edge *edges=(Edge*)malloc(capacity*sizeof(Edge));*count=0;char *a;
    while((a=word())!=NULL){char *b=word();if(strcmp(a,"*")==0){char *c=word();free(a);free(b);free(c);break;}if(*count==capacity){capacity*=2;edges=(Edge*)realloc(edges,capacity*sizeof(Edge));}edges[(*count)++]=(Edge){a,b,0,0};}return edges;}
int name_compare(const void *a,const void *b){return strcmp(*(char*const*)a,*(char*const*)b);}
int id(char **names,int n,char *name){int l=0,r=n;while(l<r){int m=(l+r)/2;if(strcmp(names[m],name)<0)l=m+1;else r=m;}return l;}
int pair_compare(const void *a,const void *b){const Pair *p=(const Pair*)a,*q=(const Pair*)b;return p->a!=q->a?(p->a>q->a)-(p->a<q->a):(p->b>q->b)-(p->b<q->b);}
int lower(Pair *a,int n,Pair key){int l=0,r=n;while(l<r){int m=(l+r)/2;if(pair_compare(&a[m],&key)<0)l=m+1;else r=m;}return l;}
int contains(Pair *a,int n,Pair key){int p=lower(a,n,key);return p<n&&pair_compare(&a[p],&key)==0;}
int find(int *parent,int a){while(parent[a]!=a){parent[a]=parent[parent[a]];a=parent[a];}return a;}
void join(int *parent,int *size,int a,int b){a=find(parent,a);b=find(parent,b);if(a==b)return;if(size[a]<size[b]){int t=a;a=b;b=t;}parent[b]=a;size[a]+=size[b];}
int consistent(Edge *old,int no,Edge *fresh,int nf){
    int entries=2*(no+nf),n=0;char **names=(char**)malloc((entries+1)*sizeof(char*));
    for(int i=0;i<no;i++){names[n++]=old[i].a;names[n++]=old[i].b;}for(int i=0;i<nf;i++){names[n++]=fresh[i].a;names[n++]=fresh[i].b;}qsort(names,n,sizeof(char*),name_compare);
    int unique=0;for(int i=0;i<n;i++)if(!unique||strcmp(names[i],names[unique-1]))names[unique++]=names[i];n=unique;
    unsigned char *was=(unsigned char*)calloc(n+1,1),*now=(unsigned char*)calloc(n+1,1);int *parent=(int*)malloc((n+1)*sizeof(int)),*size=(int*)malloc((n+1)*sizeof(int));for(int i=0;i<n;i++){parent[i]=i;size[i]=1;}
    for(int i=0;i<no;i++){old[i].u=id(names,n,old[i].a);old[i].v=id(names,n,old[i].b);was[old[i].u]=was[old[i].v]=1;}
    for(int i=0;i<nf;i++){fresh[i].u=id(names,n,fresh[i].a);fresh[i].v=id(names,n,fresh[i].b);now[fresh[i].u]=now[fresh[i].v]=1;}
    int good=1;for(int i=0;i<n;i++)if(was[i]&&!now[i])good=0;
    for(int i=0;i<nf;i++)if(!was[fresh[i].u]&&!was[fresh[i].v])join(parent,size,fresh[i].u,fresh[i].v);
    Pair *direct=(Pair*)malloc((nf+1)*sizeof(Pair)),*attach=(Pair*)malloc((nf+1)*sizeof(Pair));int nd=0,na=0;
    for(int i=0;i<nf;i++){int a=fresh[i].u,b=fresh[i].v;if(was[a]&&was[b])direct[nd++]=(Pair){a<b?a:b,a<b?b:a};else if(was[a])attach[na++]=(Pair){a,find(parent,b)};else if(was[b])attach[na++]=(Pair){b,find(parent,a)};}
    qsort(direct,nd,sizeof(Pair),pair_compare);qsort(attach,na,sizeof(Pair),pair_compare);
    for(int i=0;i<no&&good;i++){int a=old[i].u,b=old[i].v;if(a==b||contains(direct,nd,(Pair){a<b?a:b,a<b?b:a}))continue;int found=0;
        for(int j=lower(attach,na,(Pair){a,0});j<na&&attach[j].a==a;j++)if(contains(attach,na,(Pair){b,attach[j].b})){found=1;break;}if(!found)good=0;}
    free(names);free(was);free(now);free(parent);free(size);free(direct);free(attach);return good;
}
int main(void){char *old_name;while((old_name=word())!=NULL){if(strcmp(old_name,"END")==0){free(old_name);break;}int no,nf;Edge *old=read_map(&no);char *new_name=word();Edge *fresh=read_map(&nf);int good=consistent(old,no,fresh,nf);printf("%s: %s is %sa more detailed version of %s\n",good?"YES":"NO",new_name,good?"":"not ",old_name);for(int i=0;i<no;i++){free(old[i].a);free(old[i].b);}for(int i=0;i<nf;i++){free(fresh[i].a);free(fresh[i].b);}free(old);free(fresh);free(old_name);free(new_name);}return 0;}
