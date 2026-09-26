#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

char *readLine(void) {
    size_t used=0,capacity=64;char *s=(char*)malloc(capacity);int c;
    while((c=getchar())!=EOF&&c!='\n') {
        if(used+1==capacity){capacity*=2;s=(char*)realloc(s,capacity);}
        s[used++]=(char)c;
    }
    if(c==EOF&&used==0){free(s);return NULL;}
    s[used]='\0';return s;
}

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}

typedef struct{char *original,*buffer,*key[20];int size,index;} Record;
void strip_cr(char *line){size_t n=strlen(line);if(n&&line[n-1]=='\r')line[n-1]='\0';}
Record record(char *line,int index){
    Record result;result.original=line;result.buffer=copy(line);result.size=0;result.index=index;char *first=result.buffer;
    while(1){
        char *comma=strchr(first,',');if(comma)*comma='\0';char *key=first;while(*key==' ')key++;
        size_t length=strlen(key);while(length&&key[length-1]==' ')key[--length]='\0';result.key[result.size++]=key;
        if(!comma)break;first=comma+1;
    }
    return result;
}
int compare_record(const void *left,const void *right){
    const Record*a=(const Record*)left,*b=(const Record*)right;int size=a->size<b->size?a->size:b->size;
    for(int i=0;i<size;i++){int order=strcmp(a->key[i],b->key[i]);if(order)return order;}
    if(a->size!=b->size)return a->size-b->size;return a->index-b->index;
}
int main(void){
    char *line=readLine();if(!line)return 0;int tests=atoi(line);free(line);
    for(int test=0;test<tests;test++){
        Record *rows=(Record*)malloc(1000*sizeof(Record));int count=0;
        while((line=readLine())!=NULL){strip_cr(line);if(*line)break;free(line);}
        while(line&&*line){rows[count]=record(line,count);count++;line=readLine();if(line)strip_cr(line);}
        free(line);qsort(rows,count,sizeof(Record),compare_record);if(test)putchar('\n');
        for(int i=0;i<count;i++){puts(rows[i].original);free(rows[i].original);free(rows[i].buffer);}free(rows);
    }
    return 0;
}
