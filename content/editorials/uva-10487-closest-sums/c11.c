#include <stdio.h>
#include <stdlib.h>
int compare(const void *a,const void *b) {
    long long x=*(const long long*)a,y=*(const long long*)b;
    return (x>y)-(x<y);
}
int main(void) {
    int n,tc=0;
    while(scanf("%d",&n)==1 && n) {
        long long *a=malloc((size_t)n*sizeof(long long));
        for(int i=0;i<n;++i) scanf("%lld",&a[i]);
        int count=n*(n-1)/2,at=0;
        long long *sums=malloc((size_t)count*sizeof(long long));
        for(int i=0;i<n;++i) for(int j=i+1;j<n;++j) sums[at++]=a[i]+a[j];
        qsort(sums,count,sizeof(long long),compare);
        printf("Case %d:\n",++tc);
        int queries;scanf("%d",&queries);
        while(queries--) {
            long long target;scanf("%lld",&target);
            int left=0,right=count;
            while(left<right) {
                int middle=(left+right)/2;
                if(sums[middle]<target) left=middle+1;
                else right=middle;
            }
            long long answer=left==count?sums[count-1]:sums[left];
            if(left>0 && llabs(sums[left-1]-target)<llabs(answer-target)) answer=sums[left-1];
            printf("Closest sum to %lld is %lld.\n",target,answer);
        }
        free(a);free(sums);
    }
    return 0;
}
