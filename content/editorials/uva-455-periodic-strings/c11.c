#include <stdio.h>
#include <string.h>
int main(void) {
    int tests;scanf("%d",&tests);
    for(int tc=0;tc<tests;++tc) {
        char text[1001];scanf("%1000s",text);int n=(int)strlen(text),answer=n;
        for(int period=1;period<=n;++period) {
            if(n%period) continue;
            int good=1;
            for(int i=period;i<n;++i) if(text[i]!=text[i%period]) good=0;
            if(good) {answer=period;break;}
        }
        if(tc) putchar('\n');
        printf("%d\n",answer);
    }
    return 0;
}
