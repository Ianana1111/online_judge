#include <stdio.h>
#include <string.h>
int x[19900],y[19900],round_known[19900],frequency[40001],pairs;
void solve(int n){
    pairs=0;for(int a=1;a<=n;a++)for(int b=a+1;b<=n;b++){x[pairs]=a;y[pairs]=b;round_known[pairs++]=-1;}
    int empty_rounds=0;
    for(int turn=0;turn<=100;turn++){
        memset(frequency,0,sizeof(frequency));
        for(int i=0;i<pairs;i++)if(round_known[i]<0)frequency[turn%2?x[i]*y[i]:x[i]+y[i]]++;
        int removed=0;
        for(int i=0;i<pairs;i++)if(round_known[i]<0&&frequency[turn%2?x[i]*y[i]:x[i]+y[i]]==1){round_known[i]=turn;removed++;}
        empty_rounds=removed?0:empty_rounds+1;if(empty_rounds==2)break;
    }
}
int main(void){
    int n,m,cached=-1;
    while(scanf("%d%d",&n,&m)==2){
        if(n!=cached){solve(n);cached=n;}int count=0;for(int i=0;i<pairs;i++)if(round_known[i]==m)count++;
        printf("%d\n",count);for(int i=0;i<pairs;i++)if(round_known[i]==m)printf("%d %d\n",x[i],y[i]);
    }
    return 0;
}
