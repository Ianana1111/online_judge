#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int n,tc=0;
    while(scanf("%d",&n)==1) {
        long long *a=malloc((size_t)n*sizeof(long long));
        for(int i=0;i<n;++i) scanf("%lld",&a[i]);
        long long answer=0;
        for(int left=0;left<n;++left) {
            long long product=1;
            for(int right=left;right<n;++right) {
                product*=a[right];if(product>answer) answer=product;
            }
        }
        printf("Case #%d: The maximum product is %lld.\n\n",++tc,answer);
        free(a);
    }
    return 0;
}
