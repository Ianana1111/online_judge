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

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}

char *signed_normalize(char *s){
    int negative=*s=='-';char *digits=s+(*s=='-'||*s=='+');
    while(digits[0]=='0'&&digits[1])digits++;if(strcmp(digits,"0")==0)negative=0;
    memmove(s+negative,digits,strlen(digits)+1);if(negative)s[0]='-';return s;
}

char *with_sign(char *magnitude,int negative){
    if(negative&&strcmp(magnitude,"0")){size_t n=strlen(magnitude);magnitude=(char*)realloc(magnitude,n+2);memmove(magnitude+1,magnitude,n+1);magnitude[0]='-';}return magnitude;
}
char *normalize(char *text){size_t first=0;while(text[first]=='0'&&text[first+1])first++;if(first)memmove(text,text+first,strlen(text+first)+1);return text;}
char *add(const char *a,const char *b){
    size_t x=strlen(a),y=strlen(b),size=(x>y?x:y)+1;
    char *result=(char*)malloc(size+1);result[size]='\0';int carry=0;
    for(size_t i=0;i<size;i++){int value=carry+(i<x?a[x-1-i]-'0':0)+(i<y?b[y-1-i]-'0':0);result[size-1-i]=(char)('0'+value%10);carry=value/10;}
    return normalize(result);
}
int compare(const char *a,const char *b){size_t x=strlen(a),y=strlen(b);if(x!=y)return x>y?1:-1;int sign=strcmp(a,b);return (sign>0)-(sign<0);}
char *subtract(const char *a,const char *b){
    size_t x=strlen(a),y=strlen(b);char *result=(char*)malloc(x+1);result[x]='\0';int borrow=0;
    for(size_t i=0;i<x;i++){int value=a[x-1-i]-'0'-(i<y?b[y-1-i]-'0':0)-borrow;borrow=value<0;if(borrow)value+=10;result[x-1-i]=(char)('0'+value);}
    return normalize(result);
}

char *signed_add(const char *a,const char *b){
    int an=*a=='-',bn=*b=='-';const char *x=a+an,*y=b+bn;
    if(an==bn)return with_sign(add(x,y),an);
    int order=compare(x,y);if(order>=0)return with_sign(subtract(x,y),an);return with_sign(subtract(y,x),bn);
}

char *unsigned_multiply(const char *a,const char *b){
    size_t n=strlen(a),m=strlen(b);unsigned char *digit=(unsigned char*)calloc(n+m,1);
    for(size_t i=0;i<n;i++){
        int carry=0;
        for(size_t j=0;j<m;j++){int value=digit[i+j]+(a[n-1-i]-'0')*(b[m-1-j]-'0')+carry;digit[i+j]=(unsigned char)(value%10);carry=value/10;}
        size_t at=i+m;while(carry){int value=digit[at]+carry;digit[at++]=(unsigned char)(value%10);carry=value/10;}
    }
    char *result=(char*)malloc(n+m+1);for(size_t i=0;i<n+m;i++)result[n+m-1-i]=(char)('0'+digit[i]);result[n+m]='\0';free(digit);return normalize(result);
}

char *signed_multiply(const char *a,const char *b){int an=*a=='-',bn=*b=='-';return with_sign(unsigned_multiply(a+an,b+bn),an!=bn);}

int main(void){
    char *expression;
    while((expression=word())!=NULL){
        char *token=word();int count=atoi(token);free(token);char *constants[20];char operators[20];int depth=0;size_t at=0;
        char **result=(char**)malloc(count*sizeof(char*));
        while(1){
            at++;size_t first=at;if(expression[at]=='-')at++;
            while(expression[at]>='0'&&expression[at]<='9')at++;
            size_t length=at-first;char *value=(char*)malloc(length+1);memcpy(value,expression+first,length);value[length]='\0';signed_normalize(value);
            if(expression[at]==']'){for(int i=0;i<count;i++)result[i]=copy(value);free(value);break;}
            constants[depth]=value;operators[depth++]=expression[at++];
        }
        for(int frame=depth-1;frame>=0;frame--){
            char **updated=(char**)malloc(count*sizeof(char*));
            if(operators[frame]=='+'){
                updated[0]=copy(constants[frame]);for(int i=1;i<count;i++)updated[i]=signed_add(updated[i-1],result[i-1]);
            }else{
                updated[0]=signed_multiply(constants[frame],result[0]);for(int i=1;i<count;i++)updated[i]=signed_multiply(updated[i-1],result[i]);
            }
            for(int i=0;i<count;i++)free(result[i]);free(result);result=updated;free(constants[frame]);
        }
        for(int i=0;i<count;i++){if(i)putchar(' ');printf("%s",result[i]);free(result[i]);}putchar('\n');free(result);free(expression);
    }
    return 0;
}
