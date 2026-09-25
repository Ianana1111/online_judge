#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int compare(const void *a,const void *b) {return strcmp(*(char*const*)a,*(char*const*)b);}
int main(void) {
    char line[1001];if(!fgets(line,sizeof(line),stdin)) return 0;
    int tests=atoi(line);
    for(int tc=0;tc<tests;++tc) {
        char **names=NULL;int total=0,capacity=0;
        while(fgets(line,sizeof(line),stdin)) {
            size_t length=strlen(line);
            while(length && (line[length-1]=='\n'||line[length-1]=='\r')) line[--length]='\0';
            if(!length) {if(total) break;continue;}
            if(total==capacity) {capacity=capacity?capacity*2:128;names=realloc(names,(size_t)capacity*sizeof(char*));}
            names[total]=malloc(length+1);strcpy(names[total++],line);
        }
        qsort(names,total,sizeof(char*),compare);
        if(tc) putchar('\n');
        for(int i=0;i<total;) {
            int end=i+1;while(end<total && strcmp(names[i],names[end])==0) ++end;
            long long scaled=((long long)(end-i)*1000000+total/2)/total;
            printf("%s %lld.%04lld\n",names[i],scaled/10000,scaled%10000);
            i=end;
        }
        for(int i=0;i<total;++i) free(names[i]);free(names);
    }
    return 0;
}
