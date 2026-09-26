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

char *signed_normalize(char *s){
    int negative=*s=='-';char *digits=s+(*s=='-'||*s=='+');
    while(digits[0]=='0'&&digits[1])digits++;if(strcmp(digits,"0")==0)negative=0;
    memmove(s+negative,digits,strlen(digits)+1);if(negative)s[0]='-';return s;
}

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}

char *with_sign(char *magnitude,int negative){
    if(negative&&strcmp(magnitude,"0")){size_t n=strlen(magnitude);magnitude=(char*)realloc(magnitude,n+2);memmove(magnitude+1,magnitude,n+1);magnitude[0]='-';}return magnitude;
}

char *negate(const char *s){if(*s=='-')return copy(s+1);return with_sign(copy(s),1);}
char *normalize(char *text){size_t first=0;while(text[first]=='0'&&text[first+1])first++;if(first)memmove(text,text+first,strlen(text+first)+1);return text;}
int compare(const char *a,const char *b){size_t x=strlen(a),y=strlen(b);if(x!=y)return x>y?1:-1;int sign=strcmp(a,b);return (sign>0)-(sign<0);}
char *subtract(const char *a,const char *b){
    size_t x=strlen(a),y=strlen(b);char *result=(char*)malloc(x+1);result[x]='\0';int borrow=0;
    for(size_t i=0;i<x;i++){int value=a[x-1-i]-'0'-(i<y?b[y-1-i]-'0':0)-borrow;borrow=value<0;if(borrow)value+=10;result[x-1-i]=(char)('0'+value);}
    return normalize(result);
}

void unsigned_divide(const char *a,const char *b,char **quotient,char **remainder){
    size_t n=strlen(a);char *q=(char*)malloc(n+1),*r=copy("0");
    for(size_t i=0;i<n;i++){
        size_t length=strlen(r);r=(char*)realloc(r,length+2);r[length]=a[i];r[length+1]='\0';normalize(r);
        int digit=0;
        while(compare(r,b)>=0){char *next=subtract(r,b);free(r);r=next;digit++;}
        q[i]=(char)('0'+digit);
    }
    q[n]='\0';*quotient=normalize(q);*remainder=r;
}
char *add(const char *a,const char *b){
    size_t x=strlen(a),y=strlen(b),size=(x>y?x:y)+1;
    char *result=(char*)malloc(size+1);result[size]='\0';int carry=0;
    for(size_t i=0;i<size;i++){int value=carry+(i<x?a[x-1-i]-'0':0)+(i<y?b[y-1-i]-'0':0);result[size-1-i]=(char)('0'+value%10);carry=value/10;}
    return normalize(result);
}

void floor_divide(const char *a,const char *positive,char **quotient,char **remainder){
    int negative=*a=='-';char *q,*r;unsigned_divide(a+negative,positive,&q,&r);
    if(negative&&strcmp(r,"0")){
        char *next=add(q,"1");free(q);q=next;next=subtract(positive,r);free(r);r=next;
    }
    *quotient=with_sign(q,negative);*remainder=r;
}

int main(void){
    char *a;
    while((a=word())!=NULL){
        char *b=word();if(!b){free(a);break;}signed_normalize(a);signed_normalize(b);
        if(*b=='-'){char *next=negate(a);free(a);a=next;next=negate(b);free(b);b=next;}
        int index=0;putchar('[');
        while(strcmp(b,"0")){
            char *q,*r;floor_divide(a,b,&q,&r);
            if(index>1)putchar(',');printf("%s",q);if(index==0)putchar(';');
            free(q);free(a);a=b;b=r;index++;
        }
        puts("]");free(a);free(b);
    }
    return 0;
}
