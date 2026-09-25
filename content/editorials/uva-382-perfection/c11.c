#include <stdio.h>
int main(void) {
    puts("PERFECTION OUTPUT");
    int n;
    while(scanf("%d",&n)==1 && n) {
        int total=n==1?0:1;
        for(int divisor=2;divisor*divisor<=n;++divisor) if(n%divisor==0) {
            total+=divisor;
            int pair=n/divisor;
            if(pair!=divisor) total+=pair;
        }
        printf("%5d  %s\n",n,total==n?"PERFECT":total>n?"ABUNDANT":"DEFICIENT");
    }
    puts("END OF OUTPUT");
    return 0;
}
