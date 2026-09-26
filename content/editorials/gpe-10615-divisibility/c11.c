#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define MOD 1000000009
int *current,*following,*next_active;unsigned char *seen;int width,next_count;
void transfer(int code,int shift,int lo,int hi,int flag){if(lo>hi)return;int target=(code&~(3<<shift))|(flag<<shift),window=0;for(int sum=0;sum<width;sum++){if(sum>=lo){window+=current[code*width+sum-lo];if(window>=MOD)window-=MOD;}if(sum>hi){window-=current[code*width+sum-hi-1];if(window<0)window+=MOD;}if(window){int *cell=&following[target*width+sum];*cell+=window;if(*cell>=MOD)*cell-=MOD;if(!seen[target]){seen[target]=1;next_active[next_count++]=target;}}}}
int main(void){int cases;scanf("%d",&cases);for(int tc=1;tc<=cases;tc++){int n,prime;scanf("%d%d",&n,&prime);long long lower[7],upper[7];for(int i=0;i<n;i++)scanf("%lld",&lower[i]);for(int i=0;i<n;i++)scanf("%lld",&upper[i]);int ld[7][64]={{0}},ud[7][64]={{0}},length=1;for(int i=0;i<n;i++){int count=0;long long a=lower[i],b=upper[i];do{ld[i][count]=(int)(a%prime);ud[i][count++]=(int)(b%prime);a/=prime;b/=prime;}while(b);if(count>length)length=count;}
    int states=1<<(2*n),initial=states-1,*dp=(int*)calloc(states,sizeof(int)),*active=(int*)malloc(states*sizeof(int)),active_count=1;next_active=(int*)malloc(states*sizeof(int));seen=(unsigned char*)malloc(states);width=prime;current=(int*)calloc((size_t)states*width,sizeof(int));following=(int*)calloc((size_t)states*width,sizeof(int));dp[initial]=1;active[0]=initial;
    for(int pos=length-1;pos>=0;pos--){memset(current,0,(size_t)states*width*sizeof(int));for(int i=0;i<active_count;i++){int code=active[i];current[code*width]=dp[code];}
        for(int coordinate=0;coordinate<n;coordinate++){memset(following,0,(size_t)states*width*sizeof(int));memset(seen,0,states);next_count=0;int shift=2*coordinate,l=ld[coordinate][pos],u=ud[coordinate][pos];for(int i=0;i<active_count;i++){int code=active[i],flag=code>>shift&3;if(flag==0)transfer(code,shift,0,prime-1,0);else if(flag==1){transfer(code,shift,l,l,1);transfer(code,shift,l+1,prime-1,0);}else if(flag==2){transfer(code,shift,0,u-1,0);transfer(code,shift,u,u,2);}else if(l==u)transfer(code,shift,l,l,3);else{transfer(code,shift,l,l,1);transfer(code,shift,l+1,u-1,0);transfer(code,shift,u,u,2);}}
            int *swap=current;current=following;following=swap;swap=active;active=next_active;next_active=swap;active_count=next_count;
        }
        memset(dp,0,states*sizeof(int));for(int i=0;i<active_count;i++){int code=active[i];for(int sum=0;sum<width;sum++){dp[code]+=current[code*width+sum];if(dp[code]>=MOD)dp[code]-=MOD;}}
    }
    int answer=0;for(int i=0;i<active_count;i++){answer+=dp[active[i]];if(answer>=MOD)answer-=MOD;}printf("Case %d: %d\n",tc,answer);free(dp);free(active);free(next_active);free(seen);free(current);free(following);
}return 0;}
