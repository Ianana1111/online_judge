#include <stdio.h>
int main(void) {
    int primes[3500],count=0;
    for(int candidate=2;count<3500;++candidate) {
        int prime=1;
        for(int i=0;i<count && primes[i]*primes[i]<=candidate;++i)
            if(candidate%primes[i]==0) {prime=0;break;}
        if(prime) primes[count++]=candidate;
    }
    int n;
    while(scanf("%d",&n)==1 && n) {
        int survivor=0;
        for(int size=2;size<=n;++size) survivor=(survivor+primes[n-size])%size;
        printf("%d\n",survivor+1);
    }
    return 0;
}
