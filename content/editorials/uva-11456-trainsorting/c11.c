#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef struct{char *value;int index;}Car;
static int compare(const void *left,const void *right){
 const Car *a=left,*b=right;size_t la=strlen(a->value),lb=strlen(b->value);
 if(la!=lb)return (la>lb)-(la<lb);return strcmp(a->value,b->value);
}
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int n;scanf("%d",&n);Car *cars=malloc((size_t)(n?n:1)*sizeof(Car));int *weight=malloc((size_t)(n?n:1)*sizeof(int));
  char buffer[100000];
  for(int i=0;i<n;i++){
   scanf("%99999s",buffer);char *first=buffer;while(*first=='0'&&first[1])first++;
   cars[i].value=malloc(strlen(first)+1);strcpy(cars[i].value,first);cars[i].index=i;
  }
  qsort(cars,n,sizeof(Car),compare);
  for(int rank=0;rank<n;rank++)weight[cars[rank].index]=rank;
  int *rise=malloc((size_t)(n?n:1)*sizeof(int)),*fall=malloc((size_t)(n?n:1)*sizeof(int));int answer=0;
  for(int i=n-1;i>=0;i--){
   rise[i]=fall[i]=1;
   for(int j=i+1;j<n;j++){
    if(weight[j]>weight[i]&&rise[j]+1>rise[i])rise[i]=rise[j]+1;
    if(weight[j]<weight[i]&&fall[j]+1>fall[i])fall[i]=fall[j]+1;
   }
   if(rise[i]+fall[i]-1>answer)answer=rise[i]+fall[i]-1;
  }
  printf("%d\n",answer);
  for(int i=0;i<n;i++)free(cars[i].value);
  free(cars);free(weight);free(rise);free(fall);
 }
 return 0;
}
