#include <stdio.h>
#include <stdlib.h>
#include <string.h>
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

int letter(int c){return (c>='a'&&c<='z')||(c>='A'&&c<='Z');}
int digit(int c){return c>='0'&&c<='9';}
void update(int *tree,int n,int p,int delta){for(;p<=n;p+=p&-p)tree[p]+=delta;}
int kth(int *tree,int n,int k){int p=0,jump=1;while(jump<=n/2)jump*=2;for(;jump;jump/=2){int q=p+jump;if(q<=n&&tree[q]<k){p=q;k-=tree[q];}}return p+1;}
int main(void){
    size_t size=0,capacity=64;char *text=(char*)malloc(capacity),*line;
    while((line=readLine())!=NULL){size_t len=strlen(line);if(len&&line[len-1]=='\r')line[--len]='\0';if(strcmp(line,"0")==0){free(line);break;}while(size+len+2>capacity){capacity*=2;text=(char*)realloc(text,capacity);}memcpy(text+size,line,len);size+=len;text[size++]='\n';free(line);}text[size]='\0';
    int events=0;for(size_t i=0;i<size;){if(letter(text[i])){events++;while(i<size&&letter(text[i]))i++;}else if(digit(text[i])){events++;while(i<size&&digit(text[i]))i++;}else i++;}
    int *tree=(int*)calloc((size_t)events+1,sizeof(int)),front=events+1;char **words=(char**)calloc((size_t)events+1,sizeof(char*));
    for(size_t i=0;i<size;){char *word;
        if(letter(text[i])){size_t start=i;while(i<size&&letter(text[i]))i++;size_t length=i-start;word=(char*)malloc(length+1);memcpy(word,text+start,length);word[length]='\0';}
        else if(digit(text[i])){int index=0;while(i<size&&digit(text[i]))index=index*10+text[i++]-'0';int old=kth(tree,events,index);word=words[old];words[old]=NULL;update(tree,events,old,-1);}
        else {putchar(text[i++]);continue;}
        words[--front]=word;update(tree,events,front,1);fputs(word,stdout);
    }
    for(int i=1;i<=events;i++)free(words[i]);free(words);free(tree);free(text);return 0;
}
