#include <stdio.h>
#include <string.h>
int palindrome(int value) {
    char digits[5];sprintf(digits,"%d",value);
    int n=(int)strlen(digits);
    for(int i=0;i<n/2;++i) if(digits[i]!=digits[n-1-i]) return 0;
    return 1;
}
int main(void) {
    int valid[1440],count=0;
    for(int time=0;time<1440;++time)
        if(palindrome((time/60)*100+time%60)) valid[count++]=time;
    int tests;scanf("%d",&tests);
    while(tests--) {
        int hours,minutes;scanf("%d:%d",&hours,&minutes);
        int now=hours*60+minutes,answer=valid[0];
        for(int i=0;i<count;++i) if(valid[i]>now) {answer=valid[i];break;}
        printf("%02d:%02d\n",answer/60,answer%60);
    }
    return 0;
}
