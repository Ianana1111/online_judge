#include <stdio.h>
int main(void) {
    unsigned char prime[1001]={0};
    for(int i=2;i<=1000;++i) prime[i]=1;
    for(int p=2;p*p<=1000;++p) if(prime[p])
        for(int value=p*p;value<=1000;value+=p) prime[value]=0;
    int n,c;
    while(scanf("%d %d",&n,&c)==2) {
        int values[1001],length=1;values[0]=1;
        for(int value=2;value<=n;++value) if(prime[value]) values[length++]=value;
        int take=2*c-length%2;if(take>length) take=length;
        int start=(length-take)/2;
        printf("%d %d:",n,c);
        for(int i=start;i<start+take;++i) printf(" %d",values[i]);
        puts("\n");
    }
    return 0;
}
