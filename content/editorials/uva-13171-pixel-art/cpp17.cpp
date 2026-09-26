#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cctype>
using namespace std;
char *word(void){
    int c;do{c=getchar();}while(c!=EOF&&isspace((unsigned char)c));
    if(c==EOF)return NULL;
    size_t size=0,capacity=32;char *text=(char*)malloc(capacity);
    do{if(size+1==capacity){capacity*=2;text=(char*)realloc(text,capacity);}text[size++]=(char)c;c=getchar();}while(c!=EOF&&!isspace((unsigned char)c));
    text[size]='\0';return text;
}
char *normalize(char *text){size_t first=0;while(text[first]=='0'&&text[first+1])first++;if(first)memmove(text,text+first,strlen(text+first)+1);return text;}
int compare(const char *a,const char *b){size_t x=strlen(a),y=strlen(b);if(x!=y)return x>y?1:-1;int sign=strcmp(a,b);return (sign>0)-(sign<0);}
char *subtract(const char *a,const char *b){
    size_t x=strlen(a),y=strlen(b);char *result=(char*)malloc(x+1);result[x]='\0';int borrow=0;
    for(size_t i=0;i<x;i++){int value=a[x-1-i]-'0'-(i<y?b[y-1-i]-'0':0)-borrow;borrow=value<0;if(borrow)value+=10;result[x-1-i]=(char)('0'+value);}
    return normalize(result);
}

int mask(int color){switch(color){case 'M':return 1;case 'Y':return 2;case 'C':return 4;case 'R':return 3;case 'B':return 7;case 'G':return 6;case 'V':return 5;default:return 0;}}
int main(void){
    char *first=word();int tests=atoi(first);free(first);
    while(tests--){
        char *stock[3];for(int i=0;i<3;i++)stock[i]=normalize(word());
        char *picture=word();int need[3]={0,0,0};
        for(size_t p=0;picture[p];p++){int bits=mask(picture[p]);for(int i=0;i<3;i++)if(bits&(1<<i))need[i]++;}
        char digits[3][32];int possible=1;
        for(int i=0;i<3;i++){sprintf(digits[i],"%d",need[i]);if(compare(stock[i],digits[i])<0)possible=0;}
        if(!possible)puts("NO");else{
            char *remaining[3];for(int i=0;i<3;i++)remaining[i]=subtract(stock[i],digits[i]);
            printf("YES %s %s %s\n",remaining[0],remaining[1],remaining[2]);for(int i=0;i<3;i++)free(remaining[i]);
        }
        for(int i=0;i<3;i++)free(stock[i]);free(picture);
    }
    return 0;
}
