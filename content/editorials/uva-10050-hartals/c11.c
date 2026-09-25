#include <stdio.h>
int main(void) {
    int tests; scanf("%d",&tests);
    while(tests--) {
        int days,parties; scanf("%d %d",&days,&parties);
        unsigned char stopped[4000]={0};
        while(parties--) {
            int period; scanf("%d",&period);
            for(int day=period;day<=days;day+=period) stopped[day]=1;
        }
        int lost=0;
        for(int day=1;day<=days;++day)
            if(stopped[day] && day%7!=6 && day%7!=0) ++lost;
        printf("%d\n",lost);
    }
    return 0;
}
