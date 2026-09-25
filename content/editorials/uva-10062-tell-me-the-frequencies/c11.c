#include <stdio.h>
#include <string.h>
int main(void) {
    char line[10000]; int first=1;
    while(fgets(line,sizeof(line),stdin)) {
        int count[128]={0};
        for(size_t i=0;line[i] && line[i]!='\n' && line[i]!='\r';++i)
            if((unsigned char)line[i]<128) ++count[(unsigned char)line[i]];
        if(!first) putchar('\n'); first=0;
        for(int printed=0;printed<96;++printed) {
            int best=-1;
            for(int code=32;code<128;++code)
                if(count[code]>0 && (best<0 || count[code]<count[best] ||
                   (count[code]==count[best] && code>best))) best=code;
            if(best<0) break;
            printf("%d %d\n",best,count[best]); count[best]=0;
        }
    }
    return 0;
}
