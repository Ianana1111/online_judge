#include <stdio.h>
#include <string.h>
#define MOD 1000000007
int main(void){
    int answer[11][101]={{0}};
    for(int base=2;base<=10;base++){
        int dp[4][10]={{0}};
        for(int digit=1;digit<base;digit++)dp[digit==base-1?2:0][digit]=1;
        for(int length=1;length<=100;length++){
            int current=0;
            for(int digit=0;digit<base;digit++)current=(current+dp[3][digit])%MOD;
            answer[base][length]=(answer[base][length-1]+current)%MOD;
            int next[4][10]={{0}};
            for(int mask=0;mask<4;mask++)for(int last=0;last<base;last++){
                for(int step=-1;step<=1;step+=2){
                    int digit=last+step;if(digit<0||digit>=base)continue;
                    int seen=mask|(digit==0?1:0)|(digit==base-1?2:0);
                    next[seen][digit]=(next[seen][digit]+dp[mask][last])%MOD;
                }
            }
            memcpy(dp,next,sizeof(dp));
        }
    }
    int tests;scanf("%d",&tests);
    while(tests--){int base,length;scanf("%d%d",&base,&length);printf("%d\n",answer[base][length]);}
    return 0;
}
