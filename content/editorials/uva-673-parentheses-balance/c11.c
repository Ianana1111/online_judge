#include <stdio.h>
#include <string.h>
int main(void) {
    int tests; scanf("%d", &tests);
    int ch=getchar(); while(ch!='\n' && ch!=EOF) ch=getchar();
    char line[1000];
    for(int tc=0;tc<tests;++tc) {
        if(!fgets(line,sizeof(line),stdin)) line[0]='\0';
        char stack[1000]; int top=0, good=1;
        for(size_t i=0;line[i] && line[i]!='\n' && line[i]!='\r';++i) {
            char c=line[i];
            if(c=='(' || c=='[') stack[top++]=c;
            else if(!top || stack[top-1]!=(c==')'?'(':'[')) {good=0; break;}
            else --top;
        }
        puts(good && top==0 ? "Yes" : "No");
    }
    return 0;
}
