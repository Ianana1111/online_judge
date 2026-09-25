#include <stdio.h>
#include <string.h>
int main(void) {
    const char *rows[]={"`1234567890-=", "qwertyuiop[]\\", "asdfghjkl;'", "zxcvbnm,./"};
    unsigned char decode[256]={0};
    for(int r=0;r<4;++r) for(size_t i=2;i<strlen(rows[r]);++i)
        decode[(unsigned char)rows[r][i]]=(unsigned char)rows[r][i-2];
    int cases; scanf("%d", &cases);
    int ch=getchar(); while(ch!='\n' && ch!=EOF) ch=getchar();
    while(cases>0 && (ch=getchar())!=EOF) {
        if(ch=='\n') {putchar('\n'); --cases; continue;}
        int lower=(ch>='A' && ch<='Z') ? ch-'A'+'a' : ch;
        putchar(decode[lower] ? decode[lower] : ch);
    }
    return 0;
}
