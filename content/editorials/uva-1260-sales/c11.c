#include <stdio.h>
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        int n,tree[5001]={0};long long answer=0;scanf("%d",&n);
        for(int i=0;i<n;++i) {
            int x;scanf("%d",&x);
            for(int j=x;j>0;j-=j&-j) answer+=tree[j];
            for(int j=x;j<=5000;j+=j&-j) ++tree[j];
        }
        printf("%lld\n",answer);
    }
    return 0;
}
