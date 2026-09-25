#include <stdio.h>
int main(void) {
    long long n,m;
    while(scanf("%lld %lld",&n,&m)==2) {
        if(n<=1 || m<=1) {puts("Boring!");continue;}
        long long sequence[100];int size=1;sequence[0]=n;
        long long current=n;
        while(current>1 && current%m==0) {current/=m;sequence[size++]=current;}
        if(current!=1) {puts("Boring!");continue;}
        for(int i=0;i<size;++i) printf("%s%lld",i?" ":"",sequence[i]);
        putchar('\n');
    }
    return 0;
}
