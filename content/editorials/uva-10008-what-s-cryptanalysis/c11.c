#include <stdio.h>
int main(void) {
    int lines, count[26]={0};
    scanf("%d", &lines);
    int ch=getchar();
    while(ch!='\n' && ch!=EOF) ch=getchar();
    while(lines>0 && (ch=getchar())!=EOF) {
        if(ch=='\n') {--lines; continue;}
        if(ch>='a' && ch<='z') ch=ch-'a'+'A';
        if(ch>='A' && ch<='Z') ++count[ch-'A'];
    }
    for(int printed=0; printed<26; ++printed) {
        int best=-1;
        for(int i=0;i<26;++i) if(count[i]>0 && (best<0 || count[i]>count[best])) best=i;
        if(best<0) break;
        printf("%c %d\n", 'A'+best, count[best]);
        count[best]=0;
    }
    return 0;
}
