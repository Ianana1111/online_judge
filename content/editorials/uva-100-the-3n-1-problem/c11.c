#include <stdio.h>
#define LIMIT 1000000
int memo[LIMIT+1]={0};
int length(unsigned long long n) {
    unsigned long long path[1000];int used=0;
    while(n>LIMIT || memo[n]==0) {
        path[used++]=n;
        n=n%2==0?n/2:3*n+1;
    }
    int result=memo[n];
    while(used) {
        unsigned long long value=path[--used];++result;
        if(value<=LIMIT) memo[value]=result;
    }
    return result;
}
int main(void) {
    memo[1]=1;int first,second;
    while(scanf("%d %d",&first,&second)==2) {
        int low=first<second?first:second,high=first>second?first:second,answer=0;
        for(int n=low;n<=high;++n) {int current=length((unsigned long long)n);if(current>answer) answer=current;}
        printf("%d %d %d\n",first,second,answer);
    }
    return 0;
}
