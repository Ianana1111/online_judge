#include <stdio.h>
#include <string.h>
int main(void) {
    int tests;scanf("%d",&tests);
    for(int tc=1;tc<=tests;++tc) {
        char encoded[10001];scanf("%10000s",encoded);
        printf("Case %d: ",tc);
        for(size_t i=0;encoded[i];) {
            char letter=encoded[i++];int count=0;
            while(encoded[i]>='0' && encoded[i]<='9') count=count*10+encoded[i++]-'0';
            while(count--) putchar(letter);
        }
        putchar('\n');
    }
    return 0;
}
