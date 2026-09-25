#include <stdio.h>
#include <stdlib.h>
static int value[100001],zeros[100001],negatives[100001];
static void add(int *tree,int n,int at,int delta){for(;at<=n;at+=at&-at)tree[at]+=delta;}
static int prefix(int *tree,int at){int result=0;for(;at>0;at-=at&-at)result+=tree[at];return result;}
int main(void){
 int n,k;
 while(scanf("%d %d",&n,&k)==2){
  for(int i=1;i<=n;i++)zeros[i]=negatives[i]=0;
  for(int i=1;i<=n;i++){
   scanf("%d",&value[i]);add(zeros,n,i,value[i]==0);add(negatives,n,i,value[i]<0);
  }
  for(int i=0;i<k;i++){
   char op;int left,right;scanf(" %c %d %d",&op,&left,&right);
   if(op=='C'){
    add(zeros,n,left,(right==0)-(value[left]==0));
    add(negatives,n,left,(right<0)-(value[left]<0));value[left]=right;
   }else{
    int zero=prefix(zeros,right)-prefix(zeros,left-1);
    int negative=prefix(negatives,right)-prefix(negatives,left-1);
    putchar(zero?'0':negative%2?'-':'+');
   }
  }
  putchar('\n');
 }
 return 0;
}
