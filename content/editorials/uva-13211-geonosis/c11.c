#include <stdio.h>
#include <stdlib.h>
int main(void){
    int tests;scanf("%d",&tests);
    while(tests--){
        int n;scanf("%d",&n);int *distance=(int*)malloc(n*n*sizeof(int)),*order=(int*)malloc(n*sizeof(int)),*active=(int*)malloc(n*sizeof(int)),count=0;
        for(int i=0;i<n*n;i++)scanf("%d",&distance[i]);for(int i=0;i<n;i++)scanf("%d",&order[i]);long long answer=0;
        for(int step=n-1;step>=0;step--){
            int k=order[step];active[count++]=k;
            for(int u=0;u<n;u++){int via=distance[u*n+k];for(int v=0;v<n;v++){int candidate=via+distance[k*n+v];if(candidate<distance[u*n+v])distance[u*n+v]=candidate;}}
            for(int i=0;i<count;i++)for(int j=0;j<count;j++)answer+=distance[active[i]*n+active[j]];
        }
        printf("%lld\n",answer);free(distance);free(order);free(active);
    }
    return 0;
}
