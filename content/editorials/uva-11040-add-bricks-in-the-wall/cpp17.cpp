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
void halve(char *a){int remainder=0;for(size_t i=0;a[i];i++){int value=remainder*10+a[i]-'0';a[i]=(char)('0'+value/2);remainder=value%2;}normalize(a);}

void signed_halve(char *s){int negative=*s=='-';halve(s+negative);signed_normalize(s);}

int main(void){
    char *token=word();if(!token)return 0;int tests=atoi(token);free(token);
    while(tests--){
        char *wall[9][9]={{0}};
        for(int r=0;r<9;r+=2)for(int c=0;c<=r;c+=2)wall[r][c]=signed_normalize(word());
        for(int r=6;r>=0;r-=2)for(int c=0;c<=r;c+=2){
            char *first=signed_subtract(wall[r][c],wall[r+2][c]);
            char *middle=signed_subtract(first,wall[r+2][c+2]);free(first);signed_halve(middle);
            wall[r+2][c+1]=middle;wall[r+1][c]=signed_add(wall[r+2][c],middle);wall[r+1][c+1]=signed_add(middle,wall[r+2][c+2]);
        }
        for(int r=0;r<9;r++){for(int c=0;c<=r;c++){if(c)putchar(' ');printf("%s",wall[r][c]);free(wall[r][c]);}putchar('\n');}
    }
    return 0;
}
