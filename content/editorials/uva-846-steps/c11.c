#include <stdio.h>
int main(void) {
    int tests; scanf("%d", &tests);
    while(tests--) {
        long long x,y; scanf("%lld %lld", &x,&y);
        long long distance=y-x;
        if(!distance) {puts("0");continue;}
        long long left=0, right=1;
        while(right*right<=distance) right*=2;
        while(left+1<right) {
            long long middle=(left+right)/2;
            if(middle*middle<=distance) left=middle;
            else right=middle;
        }
        long long root=left;
        long long moves=distance==root*root ? 2*root-1 : distance<=root*root+root ? 2*root : 2*root+1;
        printf("%lld\n", moves);
    }
    return 0;
}
