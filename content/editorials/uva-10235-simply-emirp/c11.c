#include <stdio.h>
int prime(int n) {
    if(n<2) return 0;
    for(int d=2;d*d<=n;++d) if(n%d==0) return 0;
    return 1;
}
int main(void) {
    int n;
    while(scanf("%d",&n)==1) {
        int reversed=0;
        for(int rest=n;rest>0;rest/=10) reversed=reversed*10+rest%10;
        const char *kind=!prime(n)?"not prime":reversed!=n && prime(reversed)?"emirp":"prime";
        printf("%d is %s.\n",n,kind);
    }
    return 0;
}
