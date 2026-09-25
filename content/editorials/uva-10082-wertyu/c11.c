#include <stdio.h>
#include <string.h>
int main(void) {
    const char *rows[]={"`1234567890-=", "QWERTYUIOP[]\\", "ASDFGHJKL;'", "ZXCVBNM,./"};
    unsigned char decode[256];
    for(int i=0;i<256;++i) decode[i]=(unsigned char)i;
    for(int r=0;r<4;++r) for(size_t i=1;i<strlen(rows[r]);++i)
        decode[(unsigned char)rows[r][i]]=(unsigned char)rows[r][i-1];
    int ch;
    while((ch=getchar())!=EOF) putchar(decode[(unsigned char)ch]);
    return 0;
}
