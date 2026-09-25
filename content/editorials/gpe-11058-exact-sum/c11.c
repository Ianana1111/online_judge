#include <stdio.h>
#include <stdlib.h>
int compare(const void *a,const void *b) {
    long long x=*(const long long*)a,y=*(const long long*)b;
    return (x>y)-(x<y);
}
int main(void) {
    int n;
    while(scanf("%d",&n)==1) {
        long long *prices=malloc((size_t)n*sizeof(long long));
        for(int i=0;i<n;++i) scanf("%lld",&prices[i]);
        long long money;scanf("%lld",&money);
        qsort(prices,n,sizeof(long long),compare);
        int left=0,right=n-1;long long first=0,second=0;
        while(left<right) {
            long long sum=prices[left]+prices[right];
            if(sum<money) ++left;
            else if(sum>money) --right;
            else {first=prices[left];second=prices[right];++left;--right;}
        }
        printf("Peter should buy books whose prices are %lld and %lld.\n\n",first,second);
        free(prices);
    }
    return 0;
}
