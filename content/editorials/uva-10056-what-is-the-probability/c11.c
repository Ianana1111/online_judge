#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        int n,chosen;char token[1001];scanf("%d %1000s %d",&n,token,&chosen);
        long double p=strtold(token,NULL);int positive=0;
        for(int i=0;token[i] && token[i]!='e' && token[i]!='E';++i)
            if(token[i]>='1' && token[i]<='9') positive=1;
        long double result=0;
        if(positive) {
            long double q=1-p,weight=1,total=0,target=0;
            for(int player=1;player<=n;++player) {
                total+=weight;if(player==chosen) target=weight;
                weight*=q;
            }
            result=target/total;
        }
        printf("%.4Lf\n",result);
    }
    return 0;
}
