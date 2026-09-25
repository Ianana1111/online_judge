#include <stdio.h>
#include <string.h>
int main(void) {
    char line[10001];int tests;
    if(!fgets(line,sizeof(line),stdin)) return 0;
    sscanf(line,"%d",&tests);
    for(int tc=1;tc<=tests;++tc) {
        if(tc>1) putchar('\n');
        printf("Case #%d:\n",tc);
        int started=0;
        while(fgets(line,sizeof(line),stdin)) {
            char decoded[10001];int length=0;
            char *word=strtok(line," \t\r\n");
            while(word) {
                if((int)strlen(word)>length) {decoded[length]=word[length];++length;}
                word=strtok(NULL," \t\r\n");
            }
            if(!length) {if(started) break;continue;}
            started=1;decoded[length]='\0';puts(decoded);
        }
    }
    return 0;
}
