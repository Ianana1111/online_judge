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

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}

char *signed_normalize(char *s){
    int negative=*s=='-';char *digits=s+(*s=='-'||*s=='+');
    while(digits[0]=='0'&&digits[1])digits++;if(strcmp(digits,"0")==0)negative=0;
    memmove(s+negative,digits,strlen(digits)+1);if(negative)s[0]='-';return s;
}

char *with_sign(char *magnitude,int negative){
    if(negative&&strcmp(magnitude,"0")){size_t n=strlen(magnitude);magnitude=(char*)realloc(magnitude,n+2);memmove(magnitude+1,magnitude,n+1);magnitude[0]='-';}return magnitude;
}

char *negate(const char *s){if(*s=='-')return copy(s+1);return with_sign(copy(s),1);}
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

char *signed_subtract(const char *a,const char *b){char *negative=negate(b),*result=signed_add(a,negative);free(negative);return result;}

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
    char *token;
    while((token=word())!=NULL){
        int n=atoi(token);free(token);char *coefficient[51];coefficient[0]=copy("1");
        for(int count=0;count<n;count++){
            char *root=signed_normalize(word()),*updated[51];
            for(int degree=0;degree<=count+1;degree++){
                char *product=degree<=count?signed_multiply(root,coefficient[degree]):copy("0");
                updated[degree]=signed_subtract(degree?coefficient[degree-1]:"0",product);free(product);
            }
            for(int degree=0;degree<=count;degree++)free(coefficient[degree]);
            for(int degree=0;degree<=count+1;degree++)coefficient[degree]=updated[degree];free(root);
        }
        int first=1;
        for(int degree=n;degree>=0;degree--){
            char *value=coefficient[degree];int negative=*value=='-';const char *magnitude=value+negative;
            if(degree>0&&!strcmp(magnitude,"0"))continue;
            if(!first)printf(negative?" - ":" + ");first=0;
            if(degree==0)printf("%s",magnitude);
            else{if(strcmp(magnitude,"1"))printf("%s",magnitude);putchar('x');if(degree>1)printf("^%d",degree);}
        }
        puts(" = 0");for(int degree=0;degree<=n;degree++)free(coefficient[degree]);
    }
    return 0;
}
