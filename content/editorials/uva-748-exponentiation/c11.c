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
char *normalize(char *text){size_t first=0;while(text[first]=='0'&&text[first+1])first++;if(first)memmove(text,text+first,strlen(text+first)+1);return text;}

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}

char *unsigned_multiply(const char *a,const char *b){
    size_t n=strlen(a),m=strlen(b);unsigned char *digit=(unsigned char*)calloc(n+m,1);
    for(size_t i=0;i<n;i++){
        int carry=0;
        for(size_t j=0;j<m;j++){int value=digit[i+j]+(a[n-1-i]-'0')*(b[m-1-j]-'0')+carry;digit[i+j]=(unsigned char)(value%10);carry=value/10;}
        size_t at=i+m;while(carry){int value=digit[at]+carry;digit[at++]=(unsigned char)(value%10);carry=value/10;}
    }
    char *result=(char*)malloc(n+m+1);for(size_t i=0;i<n+m;i++)result[n+m-1-i]=(char)('0'+digit[i]);result[n+m]='\0';free(digit);return normalize(result);
}

int main(void){
    char *decimal;
    while((decimal=word())!=NULL){
        char *token=word();int exponent=atoi(token);free(token);
        size_t size=strlen(decimal);char *coefficient=(char*)malloc(size+1);size_t used=0;int fractional=0,after=0;
        for(size_t i=0;i<size;i++){if(decimal[i]=='.'){after=1;continue;}coefficient[used++]=decimal[i];if(after)fractional++;}
        coefficient[used]='\0';normalize(coefficient);char *power=copy("1");
        for(int i=0;i<exponent;i++){char *next=unsigned_multiply(power,coefficient);free(power);power=next;}
        int places=fractional*exponent;size_t digits=strlen(power);
        size_t whole=digits>(size_t)places?digits-places:1,total=whole+(places?places+1:0);
        char *result=(char*)malloc(total+1);memset(result,'0',total);result[total]='\0';
        if(places){result[whole]='.';for(size_t i=0;i<digits;i++){size_t position=total-1-i;if(position<=whole)position--;result[position]=power[digits-1-i];}}
        else memcpy(result,power,digits);
        if(places){while(total&&result[total-1]=='0')result[--total]='\0';if(total&&result[total-1]=='.')result[--total]='\0';}
        char *first=result;while(*first=='0')first++;puts(*first?first:"0");
        free(decimal);free(coefficient);free(power);free(result);
    }
    return 0;
}
