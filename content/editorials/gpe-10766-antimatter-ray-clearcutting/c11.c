#include <stdio.h>
#include <string.h>
int n,target,lines[136],line_count;unsigned char bits[65536],seen[65536];signed char memo[65536];
int search(int removed){
    int need=target-bits[removed];if(need<=0)return 0;if(memo[removed]>=0)return memo[removed];
    int best=(need+1)/2;
    for(int i=0;i<line_count;i++){
        int next=removed|lines[i],gain=bits[next]-bits[removed];if(gain<3)continue;
        int candidate=1+search(next);if(candidate<best)best=candidate;if(best==1)break;
    }
    memo[removed]=(signed char)best;return best;
}
void record(int mask){if(bits[mask]>=3&&!seen[mask]){seen[mask]=1;lines[line_count++]=mask;}}
int main(void){
    for(int mask=1;mask<65536;mask++)bits[mask]=bits[mask>>1]+(mask&1);
    int tests;scanf("%d",&tests);
    for(int test=1;test<=tests;test++){
        int x[16],y[16];scanf("%d%d",&n,&target);for(int i=0;i<n;i++)scanf("%d%d",&x[i],&y[i]);
        memset(seen,0,sizeof(seen));memset(memo,-1,sizeof(memo));line_count=0;
        for(int i=0;i<n;i++){
            int same=0;for(int k=0;k<n;k++)if(x[k]==x[i]&&y[k]==y[i])same|=1<<k;record(same);
            for(int j=i+1;j<n;j++){
                long long dx=x[j]-x[i],dy=y[j]-y[i];if(!dx&&!dy)continue;int line=0;
                for(int k=0;k<n;k++)if((long long)(x[k]-x[i])*dy==(long long)(y[k]-y[i])*dx)line|=1<<k;record(line);
            }
        }
        if(test>1)putchar('\n');printf("Case #%d:\n%d\n",test,search(0));
    }
    return 0;
}
