#include <stdio.h>
#include <stdlib.h>
#define BUDGET 5000000LL
int compare(const void *a,const void *b) {
    long long x=*(const long long*)a,y=*(const long long*)b;
    return (y>x)-(y<x);
}
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        long long prices[10000];int count=0;char token[1001];
        while(scanf("%1000s",token)==1 && !(token[0]=='0' && token[1]=='\0')) {
            long long price=0;
            for(int i=0;token[i];++i) {
                int digit=token[i]-'0';
                if(price>(BUDGET+1-digit)/10) price=BUDGET+1;
                else price=price*10+digit;
                if(price>BUDGET+1) price=BUDGET+1;
            }
            prices[count++]=price;
        }
        qsort(prices,count,sizeof(long long),compare);
        long long total=0;int expensive=0;
        for(int i=0;i<count;++i) {
            long long power=1;
            for(int exponent=0;exponent<=i;++exponent) {
                if(power>BUDGET/2/prices[i]) {expensive=1;break;}
                power*=prices[i];
            }
            if(expensive || total+2*power>BUDGET) {expensive=1;break;}
            total+=2*power;
        }
        if(expensive) puts("Too expensive");else printf("%lld\n",total);
    }
    return 0;
}
