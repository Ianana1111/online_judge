#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int n;
    while(scanf("%d",&n)==1) {
        long long *tails=malloc((size_t)n*sizeof(long long));int size=0;
        for(int i=0;i<n;++i) {
            long long value;scanf("%lld",&value);
            int left=0,right=size;
            while(left<right) {
                int middle=(left+right)/2;
                if(tails[middle]<value) left=middle+1;
                else right=middle;
            }
            if(left==size) ++size;
            tails[left]=value;
        }
        printf("%d\n",size);free(tails);
    }
    return 0;
}
