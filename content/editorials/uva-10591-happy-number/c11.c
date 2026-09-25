#include <stdio.h>
int next_value(int value) {
    int total=0;
    while(value) {int digit=value%10;total+=digit*digit;value/=10;}
    return total;
}
int main(void) {
    int tests; scanf("%d",&tests);
    for(int tc=1;tc<=tests;++tc) {
        int original,value,seen[1000]={0}; scanf("%d",&original); value=original;
        while(value!=1 && (value>=1000 || !seen[value])) {
            if(value<1000) seen[value]=1;
            value=next_value(value);
        }
        printf("Case #%d: %d is %s number.\n",tc,original,value==1?"a Happy":"an Unhappy");
    }
    return 0;
}
