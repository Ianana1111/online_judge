#include <stdio.h>
#include <stdlib.h>
static int compare_long(const void *left,const void *right){long long a=*(const long long*)left,b=*(const long long*)right;return (a>b)-(a<b);}
static long long *sums(const long long *values,int begin,int end,int *count){
 int size=1<<(end-begin);long long *result=malloc((size_t)size*sizeof(long long));result[0]=0;int used=1;
 for(int i=begin;i<end;i++){for(int j=0;j<used;j++)result[used+j]=result[j]+values[i];used*=2;}
 qsort(result,size,sizeof(long long),compare_long);*count=size;return result;
}
int main(void){
 int n;long long target;
 while(scanf("%d %lld",&n,&target)==2){
  long long values[40];for(int i=0;i<n;i++)scanf("%lld",&values[i]);
  int left_count,right_count;long long *left=sums(values,0,n/2,&left_count),*right=sums(values,n/2,n,&right_count);
  int i=0,j=right_count-1;long long answer=0;
  while(i<left_count&&j>=0){long long total=left[i]+right[j];
   if(total<target){i++;continue;}if(total>target){j--;continue;}
   long long a=left[i],b=right[j],left_ways=0,right_ways=0;
   while(i<left_count&&left[i]==a){left_ways++;i++;}
   while(j>=0&&right[j]==b){right_ways++;j--;}
   answer+=left_ways*right_ways;
  }
  if(target==0)answer--;
  printf("%lld\n",answer);free(left);free(right);
 }
 return 0;
}
