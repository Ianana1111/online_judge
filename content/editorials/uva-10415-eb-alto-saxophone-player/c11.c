#include <stdio.h>
#include <string.h>
int main(void) {
    const char *notes="cdefgabCDEFGAB";
    const char *fingers[]={"2347890","234789","23478","2347","234","23","2","3","1234789","123478","12347","1234","123","12"};
    int tests;scanf("%d",&tests);
    int ch=getchar();while(ch!='\n' && ch!=EOF) ch=getchar();
    char song[10001];
    while(tests--) {
        if(!fgets(song,sizeof(song),stdin)) song[0]='\0';
        int count[10]={0},previous[10]={0};
        for(int i=0;song[i] && song[i]!='\n' && song[i]!='\r';++i) {
            const char *found=strchr(notes,song[i]);
            if(!found) continue;
            const char *pressed=fingers[found-notes];int current[10]={0};
            for(int j=0;pressed[j];++j) {
                int index=pressed[j]=='0'?9:pressed[j]-'1';current[index]=1;
            }
            for(int j=0;j<10;++j) {if(current[j] && !previous[j]) ++count[j];previous[j]=current[j];}
        }
        for(int i=0;i<10;++i) printf("%s%d",i?" ":"",count[i]);
        putchar('\n');
    }
    return 0;
}
