#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int n,game=0;
    while(scanf("%d",&n)==1 && n) {
        int *secret=malloc((size_t)n*sizeof(int)),frequency[10]={0};
        for(int i=0;i<n;++i) {scanf("%d",&secret[i]);++frequency[secret[i]];}
        printf("Game %d:\n",++game);
        for(;;) {
            int *guess=malloc((size_t)n*sizeof(int));
            for(int i=0;i<n;++i) scanf("%d",&guess[i]);
            if(guess[0]==0) {free(guess);break;}
            int other[10]={0},strong=0,total=0;
            for(int i=0;i<n;++i) {++other[guess[i]];if(guess[i]==secret[i]) ++strong;}
            for(int digit=1;digit<=9;++digit) total+=frequency[digit]<other[digit]?frequency[digit]:other[digit];
            printf("    (%d,%d)\n",strong,total-strong);
            free(guess);
        }
        free(secret);
    }
    return 0;
}
