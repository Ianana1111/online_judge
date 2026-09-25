#include <stdio.h>
int main(void) {
    int tests; scanf("%d",&tests);
    for(int tc=1;tc<=tests;++tc) {
        char digits[1001]; scanf("%1000s",digits);
        int count[3]={0},residue=0;
        for(int i=0;digits[i];++i) {int r=(digits[i]-'0')%3;++count[r];residue=(residue+r)%3;}
        int wins=0;
        if(count[residue]>0) wins=(count[0]-(residue==0))%2==0;
        printf("Case %d: %c\n",tc,wins?'S':'T');
    }
    return 0;
}
