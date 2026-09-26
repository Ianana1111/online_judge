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

int blank(const char *s){while(*s)if(!isspace((unsigned char)*s++))return 0;return 1;}
int numeric(const char *s){while(isspace((unsigned char)*s))s++;int any=0;while(*s>='0'&&*s<='9'){any=1;s++;}while(isspace((unsigned char)*s))s++;return any&&!*s;}
int decode(int c,int shift){return (c-'A'-shift+26)%26+'A';}
void message(const char *key,int shift,const char *text){size_t length=strlen(text),key_length=strlen(key),at=0,position=0,used=0;int present[26]={0};for(size_t i=0;i<key_length;i++)present[key[i]-'A']=1;char *out=(char*)malloc(length+1);int valid=1;
    while(at<length){if(text[at]==' '){out[used++]=' ';at++;continue;}
        int wrapped=key_length&&at+2<length&&text[at+1]!=' '&&text[at+2]!=' '&&text[at]==key[position]&&text[at+2]==key[(position+1)%key_length]&&present[decode(text[at+1],shift)-'A'];
        if(wrapped){out[used++]=(char)decode(text[at+1],shift);position=(position+1)%key_length;at+=3;}else{int plain=decode(text[at],shift);if(present[plain-'A']){valid=0;break;}out[used++]=(char)plain;at++;}
    }
    out[used]='\0';puts(valid?out:"error in encryption");free(out);
}
int main(void){char **lines=(char**)malloc(32*sizeof(char*)),*line;int count=0,capacity=32;while((line=readLine())!=NULL){size_t n=strlen(line);if(n&&line[n-1]=='\r')line[n-1]='\0';if(count==capacity){capacity*=2;lines=(char**)realloc(lines,capacity*sizeof(char*));}lines[count++]=line;}if(!count){free(lines);return 0;}int tests=atoi(lines[0]),at=1;
    for(int tc=0;tc<tests;tc++){while(at<count&&blank(lines[at])&&(at+1==count||!numeric(lines[at+1])))at++;char *key=lines[at++];while(isspace((unsigned char)*key))key++;size_t len=strlen(key);while(len&&isspace((unsigned char)key[len-1]))key[--len]='\0';int shift=atoi(lines[at++]),messages=atoi(lines[at++]);if(tc)putchar('\n');for(int j=0;j<messages;j++)message(key,shift,lines[at++]);}
    for(int i=0;i<count;i++)free(lines[i]);free(lines);return 0;
}
