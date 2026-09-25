#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int main(void) {
    int tests;scanf("%d",&tests);
    int ch=getchar();while(ch!='\n' && ch!=EOF) ch=getchar();
    char line[100000];
    for(int tc=0;tc<tests;++tc) {
        do {if(!fgets(line,sizeof(line),stdin)) return 0;}
        while(strspn(line," \t\r\n")==strlen(line));
        int positions[10000],count=0;
        char *token=strtok(line," \t\r\n");
        while(token) {positions[count++]=atoi(token);token=strtok(NULL," \t\r\n");}
        if(!fgets(line,sizeof(line),stdin)) return 0;
        char values[10000][101],answer[10000][101];
        token=strtok(line," \t\r\n");
        for(int i=0;i<count;++i) {
            if(!token) break;
            strcpy(values[i],token);token=strtok(NULL," \t\r\n");
            strcpy(answer[positions[i]-1],values[i]);
        }
        if(tc) putchar('\n');
        for(int i=0;i<count;++i) puts(answer[i]);
    }
    return 0;
}
