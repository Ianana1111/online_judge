#include <stdio.h>
#include <stdlib.h>
int compare(const void *a,const void *b) {
    long long x=*(const long long*)a,y=*(const long long*)b;
    return (x>y)-(x<y);
}
int main(void) {
    int n,tc=0;
    while(scanf("%d",&n)==1) {
        long long a[100],sums[5050];int good=1,count=0;
        for(int i=0;i<n;++i) {
            scanf("%lld",&a[i]);
            if(a[i]<1 || (i>0 && a[i]<=a[i-1])) good=0;
        }
        for(int i=0;i<n;++i) for(int j=i;j<n;++j) sums[count++]=a[i]+a[j];
        qsort(sums,count,sizeof(long long),compare);
        for(int i=1;i<count;++i) if(sums[i]==sums[i-1]) good=0;
        printf("Case #%d: It is %sa B2-Sequence.\n\n",++tc,good?"":"not ");
    }
    return 0;
}
