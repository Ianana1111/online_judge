#include <stdio.h>
int main(void) {
    int tests;scanf("%d",&tests);int first=1;
    while(tests--) {
        int amplitude,frequency;scanf("%d %d",&amplitude,&frequency);
        for(int wave=0;wave<frequency;++wave) {
            if(!first) putchar('\n');first=0;
            for(int h=1;h<=amplitude;++h) {
                for(int i=0;i<h;++i) putchar('0'+h);
                putchar('\n');
            }
            for(int h=amplitude-1;h>=1;--h) {
                for(int i=0;i<h;++i) putchar('0'+h);
                putchar('\n');
            }
        }
    }
    return 0;
}
