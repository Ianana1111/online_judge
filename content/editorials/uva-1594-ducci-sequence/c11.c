#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int main(void) {
    int tests; scanf("%d",&tests);
    while(tests--) {
        int n,state[15],seen[1001][15],used=0;
        scanf("%d",&n);
        for(int i=0;i<n;++i) scanf("%d",&state[i]);
        for(;;) {
            int zero=1;
            for(int i=0;i<n;++i) if(state[i]) zero=0;
            if(zero) {puts("ZERO");break;}
            int repeated=0;
            for(int step=0;step<used;++step)
                if(memcmp(seen[step],state,n*sizeof(int))==0) {repeated=1;break;}
            if(repeated) {puts("LOOP");break;}
            memcpy(seen[used++],state,n*sizeof(int));
            int next[15];
            for(int i=0;i<n;++i) next[i]=abs(state[i]-state[(i+1)%n]);
            memcpy(state,next,n*sizeof(int));
        }
    }
    return 0;
}
