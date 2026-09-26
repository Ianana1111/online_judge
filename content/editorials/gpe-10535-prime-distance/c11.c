#include <stdio.h>
#define LIMIT 100000
#define MOD 1000000007LL
long long pc[LIMIT+1],ps[LIMIT+1],tc[LIMIT+1],ts[LIMIT+1];
long long choose_small(long long n,int k){
    if(n<k)return 0;long long inverse[4]={1,1,500000004,166666668},answer=1;
    for(int i=0;i<k;i++)answer=answer*(n-i)%MOD;return answer*inverse[k]%MOD;
}
int main(void){
    static unsigned char composite[LIMIT+1];composite[0]=composite[1]=1;
    for(int p=2;p*p<=LIMIT;p++)if(!composite[p])for(int j=p*p;j<=LIMIT;j+=p)composite[j]=1;
    for(int v=1;v<=LIMIT;v++){
        int prime=!composite[v],twin=v>=3&&prime&&!composite[v-2];
        pc[v]=pc[v-1]+prime;ps[v]=ps[v-1]+(prime?v:0);tc[v]=tc[v-1]+twin;ts[v]=ts[v-1]+(twin?v:0);
    }
    int tests;scanf("%d",&tests);
    for(int test=1;test<=tests;test++){
        long long n,m;scanf("%lld%lld",&n,&m);
        long long supports[5]={0,n,n*pc[n-1]-ps[n-1],2*(n*tc[n-1]-ts[n-1]),n>7?n-7:0},answer=0;
        for(int size=1;size<=4;size++)answer=(answer+supports[size]%MOD*choose_small(m-1,size-1))%MOD;
        printf("Case %d: %lld\n",test,answer);
    }
    return 0;
}
