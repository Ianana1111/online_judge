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

char *append_digits(char *s,const char *digits,size_t count){
    size_t n=strlen(s);s=(char*)realloc(s,n+count+1);memcpy(s+n,digits,count);s[n+count]='\0';return normalize(s);
}
int main(void){
    char *token=word();if(!token)return 0;int tests=atoi(token);free(token);
    for(int test=0;test<tests;test++){
        char *value=normalize(word()),*root=copy("0"),*remainder=copy("0");size_t size=strlen(value),at=0;
        while(at<size){
            size_t count=at==0&&size%2?1:2;remainder=append_digits(remainder,value+at,count);at+=count;
            char *twenty=unsigned_multiply(root,"20"),*product=NULL;int digit;
            for(digit=9;digit>=0;digit--){
                char text[2]={(char)('0'+digit),'\0'};char *base=add(twenty,text);
                product=unsigned_multiply(base,text);free(base);
                if(compare(product,remainder)<=0)break;free(product);product=NULL;
            }
            char *next=subtract(remainder,product);free(remainder);remainder=next;free(product);free(twenty);
            char text=(char)('0'+digit);root=append_digits(root,&text,1);
        }
        if(test)putchar('\n');puts(root);free(value);free(root);free(remainder);
    }
    return 0;
}
