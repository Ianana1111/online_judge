#include <stdio.h>
#include <string.h>
int ends(const char *word,const char *suffix) {
    size_t a=strlen(word),b=strlen(suffix);
    return a>=b && strcmp(word+a-b,suffix)==0;
}
int main(void) {
    int irregular,queries;scanf("%d %d",&irregular,&queries);
    char singular[100][101],plural[100][101];
    for(int i=0;i<irregular;++i) scanf("%100s %100s",singular[i],plural[i]);
    while(queries--) {
        char word[101];scanf("%100s",word);
        int found=-1;
        for(int i=0;i<irregular;++i) if(strcmp(word,singular[i])==0) {found=i;break;}
        if(found>=0) {puts(plural[found]);continue;}
        size_t length=strlen(word);
        if(length>=2 && word[length-1]=='y' && !strchr("aeiou",word[length-2])) {
            word[length-1]='\0';printf("%sies\n",word);
        } else if(ends(word,"o")||ends(word,"s")||ends(word,"ch")||ends(word,"sh")||ends(word,"x")) printf("%ses\n",word);
        else printf("%ss\n",word);
    }
    return 0;
}
