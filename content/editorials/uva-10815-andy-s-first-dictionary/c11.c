#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int compare(const void *a,const void *b) {
    return strcmp(*(char*const*)a,*(char*const*)b);
}
int main(void) {
    char **words=NULL;int count=0,capacity=0;char word[1000];int length=0,ch;
    while((ch=getchar())!=EOF) {
        if(ch>='A' && ch<='Z') ch=ch-'A'+'a';
        if(ch>='a' && ch<='z') {
            if(length<999) word[length++]=(char)ch;
        } else if(length) {
            word[length]='\0';
            if(count==capacity) {capacity=capacity?capacity*2:128;words=realloc(words,(size_t)capacity*sizeof(char*));}
            words[count]=malloc((size_t)length+1);strcpy(words[count++],word);length=0;
        }
    }
    if(length) {
        word[length]='\0';
        if(count==capacity) {capacity=capacity?capacity*2:128;words=realloc(words,(size_t)capacity*sizeof(char*));}
        words[count]=malloc((size_t)length+1);strcpy(words[count++],word);
    }
    qsort(words,count,sizeof(char*),compare);
    for(int i=0;i<count;++i) {
        if(i==0 || strcmp(words[i],words[i-1])!=0) puts(words[i]);
    }
    for(int i=0;i<count;++i) free(words[i]);free(words);
    return 0;
}
