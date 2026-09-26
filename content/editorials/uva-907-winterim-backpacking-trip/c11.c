#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
char *word(void){
    int c;do{c=getchar();}while(c!=EOF&&isspace((unsigned char)c));
    if(c==EOF)return NULL;
    size_t size=0,capacity=32;char *text=(char*)malloc(capacity);
    do{if(size+1==capacity){capacity*=2;text=(char*)realloc(text,capacity);}text[size++]=(char)c;c=getchar();}while(c!=EOF&&!isspace((unsigned char)c));
    text[size]='\0';return text;
}
char *normalize(char *text){size_t first=text[0]=='+';while(text[first]=='0'&&text[first+1])first++;if(first)memmove(text,text+first,strlen(text+first)+1);return text;}

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}
char *add(const char *a,const char *b){
    size_t x=strlen(a),y=strlen(b),size=(x>y?x:y)+1;
    char *result=(char*)malloc(size+1);result[size]='\0';int carry=0;
    for(size_t i=0;i<size;i++){int value=carry+(i<x?a[x-1-i]-'0':0)+(i<y?b[y-1-i]-'0':0);result[size-1-i]=(char)('0'+value%10);carry=value/10;}
    return normalize(result);
}
void halve(char *a){int remainder=0;for(size_t i=0;a[i];i++){int value=remainder*10+a[i]-'0';a[i]=(char)('0'+value/2);remainder=value%2;}normalize(a);}
int compare(const char *a,const char *b){size_t x=strlen(a),y=strlen(b);if(x!=y)return x>y?1:-1;int sign=strcmp(a,b);return (sign>0)-(sign<0);}

int main(void){
    char *token;
    while((token=word())!=NULL){
        int n=atoi(token);free(token);token=word();int nights=atoi(token);free(token);
        char *distance[601],*low=copy("0"),*high=copy("0");
        for(int i=0;i<=n;i++){
            distance[i]=normalize(word());if(compare(distance[i],low)>0){free(low);low=copy(distance[i]);}
            char *next=add(high,distance[i]);free(high);high=next;
        }
        while(compare(low,high)<0){
            char *middle=add(low,high);halve(middle);char *walked=copy("0");int days=1;
            for(int i=0;i<=n;i++){
                char *next=add(walked,distance[i]);
                if(compare(next,middle)>0){days++;free(next);next=copy(distance[i]);}
                free(walked);walked=next;if(days>nights+1)break;
            }
            free(walked);
            if(days<=nights+1){free(high);high=middle;}
            else{free(low);low=add(middle,"1");free(middle);}
        }
        puts(low);free(low);free(high);for(int i=0;i<=n;i++)free(distance[i]);
    }
    return 0;
}
