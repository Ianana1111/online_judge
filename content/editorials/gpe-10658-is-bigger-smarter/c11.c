#include <stdio.h>
#include <stdlib.h>
typedef struct{int weight,iq,id;} Elephant;
static Elephant animal[1000];static int length[1000],previous[1000],path[1000];
static int compare(const void*l,const void*r){
 const Elephant*a=l,*b=r;
 if(a->weight!=b->weight)return a->weight<b->weight?-1:1;
 if(a->iq!=b->iq)return a->iq>b->iq?-1:1;
 return a->id-b->id;
}
int main(void){
 int n=0,w,iq;
 while(scanf("%d %d",&w,&iq)==2){animal[n].weight=w;animal[n].iq=iq;animal[n].id=n+1;n++;}
 qsort(animal,n,sizeof(Elephant),compare);int last=-1;
 for(int i=0;i<n;i++){
  length[i]=1;previous[i]=-1;
  for(int j=0;j<i;j++)if(animal[j].weight<animal[i].weight&&animal[j].iq>animal[i].iq&&length[j]+1>length[i]){
   length[i]=length[j]+1;previous[i]=j;
  }
  if(last<0||length[i]>length[last])last=i;
 }
 int count=0;for(int i=last;i>=0;i=previous[i])path[count++]=animal[i].id;
 printf("%d\n",count);for(int i=count-1;i>=0;i--)printf("%d\n",path[i]);
 return 0;
}
