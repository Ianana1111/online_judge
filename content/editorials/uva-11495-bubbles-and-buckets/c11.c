#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int n;
    while(scanf("%d",&n)==1 && n) {
        int *tree=calloc((size_t)n+1,sizeof(int));long long moves=0;
        for(int i=0;i<n;++i) {
            int x,not_greater=0;scanf("%d",&x);
            for(int j=x;j>0;j-=j&-j) not_greater+=tree[j];
            moves+=i-not_greater;
            for(int j=x;j<=n;j+=j&-j) ++tree[j];
        }
        printf("%s %lld\n",moves%2?"Marcelo":"Carlos",moves);
        free(tree);
    }
    return 0;
}
