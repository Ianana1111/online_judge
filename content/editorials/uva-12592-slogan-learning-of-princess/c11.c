#include <stdio.h>
#include <stdlib.h>
#include <string.h>
void trim(char *text) {
    size_t length=strlen(text);
    while(length && (text[length-1]=='\n' || text[length-1]=='\r')) text[--length]='\0';
}
int main(void) {
    int n;scanf("%d",&n);
    int ch=getchar();while(ch!='\n' && ch!=EOF) ch=getchar();
    char first[100][1001],second[100][1001],query[1001];
    for(int i=0;i<n;++i) {
        fgets(first[i],sizeof(first[i]),stdin);trim(first[i]);
        fgets(second[i],sizeof(second[i]),stdin);trim(second[i]);
    }
    int queries;scanf("%d",&queries);
    ch=getchar();while(ch!='\n' && ch!=EOF) ch=getchar();
    while(queries--) {
        fgets(query,sizeof(query),stdin);trim(query);
        for(int i=0;i<n;++i) if(strcmp(first[i],query)==0) {puts(second[i]);break;}
    }
    return 0;
}
