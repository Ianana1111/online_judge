#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int m,n,t;
    while(scanf("%d %d %d",&m,&n,&t)==3) {
        int *best=malloc(((size_t)t+1)*sizeof(int));
        for(int i=0;i<=t;++i) best[i]=-1;
        best[0]=0;
        for(int time=1;time<=t;++time) {
            if(time>=m && best[time-m]>=0 && best[time-m]+1>best[time]) best[time]=best[time-m]+1;
            if(time>=n && best[time-n]>=0 && best[time-n]+1>best[time]) best[time]=best[time-n]+1;
        }
        int used=t;while(best[used]<0) --used;
        if(used<t) printf("%d %d\n",best[used],t-used);
        else printf("%d\n",best[used]);
        free(best);
    }
    return 0;
}
