#include <stdio.h>
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        int n,last;scanf("%d %d",&n,&last);
        int answer=1,need_down=1;
        for(int i=1;i<n;++i) {
            int current;scanf("%d",&current);
            if((need_down && last>current)||(!need_down && last<current)) {
                ++answer;need_down=!need_down;
            }
            last=current;
        }
        printf("%d\n",answer);
    }
    return 0;
}
