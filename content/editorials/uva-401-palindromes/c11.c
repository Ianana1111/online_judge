#include <stdio.h>
#include <string.h>
int main(void) {
    char mirror[128]={0};
    const char *same="AHIMOTUVWXY18";
    for(int i=0;same[i];++i) mirror[(int)same[i]]=same[i];
    const char *left="EJSZ",*right="3L25";
    for(int i=0;left[i];++i) {mirror[(int)left[i]]=right[i];mirror[(int)right[i]]=left[i];}
    char text[1001];
    while(scanf("%1000s",text)==1) {
        int length=(int)strlen(text),palindrome=1,mirrored=1;
        for(int i=0;i<length;++i) {
            char other=text[length-1-i];
            if(text[i]!=other) palindrome=0;
            if(mirror[(unsigned char)text[i]]!=other) mirrored=0;
        }
        printf("%s -- is %s\n\n",text,palindrome?(mirrored?"a mirrored palindrome.":"a regular palindrome."):(mirrored?"a mirrored string.":"not a palindrome."));
    }
    return 0;
}
