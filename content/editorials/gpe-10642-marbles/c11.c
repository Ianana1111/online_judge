#include <stdio.h>
#include <string.h>
#define MOD 1000000007LL
long long factorial[100001],inverse[100001],binomial[100001],previous[100001],current[100001];
long long power(long long base,long long exponent){long long answer=1;while(exponent){if(exponent&1)answer=answer*base%MOD;base=base*base%MOD;exponent>>=1;}return answer;}
long long choose(int n,int k){return factorial[n]*inverse[k]%MOD*inverse[n-k]%MOD;}
int main(void){
    factorial[0]=1;for(int i=1;i<=100000;i++)factorial[i]=factorial[i-1]*i%MOD;
    inverse[100000]=power(factorial[100000],MOD-2);for(int i=100000;i>0;i--)inverse[i-1]=inverse[i]*i%MOD;
    int tests;scanf("%d",&tests);int n[50],k[50],x[50],done[50]={0};long long answer[50]={0};
    for(int i=0;i<tests;i++){
        scanf("%d%d%d",&n[i],&k[i],&x[i]);
        if(n[i]<k[i]*x[i])done[i]=1;
        else if(k[i]==1){answer[i]=1;done[i]=1;}
        else if(x[i]==1){
            for(int j=0;j<=k[i];j++){long long term=choose(k[i],j)*power(k[i]-j,n[i])%MOD;answer[i]=(answer[i]+(j%2?MOD-term:term))%MOD;}done[i]=1;
        }
    }
    for(int group=0;group<tests;group++)if(!done[group]){
        int largest=n[group],boxes=k[group],minimum=x[group];
        for(int i=group+1;i<tests;i++)if(!done[i]&&k[i]==boxes&&x[i]==minimum&&n[i]>largest)largest=n[i];
        for(int balls=minimum;balls<=largest;balls++)binomial[balls]=choose(balls-1,minimum-1);
        memset(previous,0,sizeof(previous));previous[0]=1;
        for(int count=1;count<=boxes;count++){
            memset(current,0,sizeof(current));int last=largest-(boxes-count)*minimum;
            for(int balls=count*minimum;balls<=last;balls++)current[balls]=count*(current[balls-1]+binomial[balls]*previous[balls-minimum]%MOD)%MOD;
            memcpy(previous,current,(largest+1)*sizeof(long long));
        }
        for(int i=group;i<tests;i++)if(!done[i]&&k[i]==boxes&&x[i]==minimum){answer[i]=previous[n[i]];done[i]=1;}
    }
    for(int i=0;i<tests;i++)printf("Case %d: %lld\n",i+1,answer[i]);return 0;
}
