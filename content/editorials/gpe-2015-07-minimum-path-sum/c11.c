#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        int rows,cols;scanf("%d %d",&rows,&cols);
        long long *dp=calloc((size_t)cols,sizeof(long long));
        for(int r=0;r<rows;++r) for(int c=0;c<cols;++c) {
            long long value;scanf("%lld",&value);
            if(r==0 && c==0) dp[c]=value;
            else if(r==0) dp[c]=dp[c-1]+value;
            else if(c==0) dp[c]+=value;
            else dp[c]=(dp[c]<dp[c-1]?dp[c]:dp[c-1])+value;
        }
        printf("%lld\n",dp[cols-1]);free(dp);
    }
    return 0;
}
