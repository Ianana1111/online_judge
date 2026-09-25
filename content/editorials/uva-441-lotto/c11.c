#include <stdio.h>
int numbers[20],chosen[6],size;
void choose(int start,int count) {
    if(count==6) {
        for(int i=0;i<6;++i) printf("%s%d",i?" ":"",chosen[i]);
        putchar('\n');return;
    }
    int needed=6-count;
    for(int i=start;i<=size-needed;++i) {
        chosen[count]=numbers[i];choose(i+1,count+1);
    }
}
int main(void) {
    int first=1;
    while(scanf("%d",&size)==1 && size) {
        for(int i=0;i<size;++i) scanf("%d",&numbers[i]);
        if(!first) putchar('\n');first=0;
        choose(0,0);
    }
    return 0;
}
