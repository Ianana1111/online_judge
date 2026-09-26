#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <cctype>
using namespace std;

char *readLine(void) {
    size_t used=0,capacity=64;char *s=(char*)malloc(capacity);int c;
    while((c=getchar())!=EOF&&c!='\n') {
        if(used+1==capacity){capacity*=2;s=(char*)realloc(s,capacity);}
        s[used++]=(char)c;
    }
    if(c==EOF&&used==0){free(s);return NULL;}
    s[used]='\0';return s;
}

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}
char *normalize(char *text){size_t first=0;while(text[first]=='0'&&text[first+1])first++;if(first)memmove(text,text+first,strlen(text+first)+1);return text;}

char *with_sign(char *magnitude,int negative){
    if(negative&&strcmp(magnitude,"0")){size_t n=strlen(magnitude);magnitude=(char*)realloc(magnitude,n+2);memmove(magnitude+1,magnitude,n+1);magnitude[0]='-';}return magnitude;
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

char *signed_add(const char *a,const char *b){
    int an=*a=='-',bn=*b=='-';const char *x=a+an,*y=b+bn;
    if(an==bn)return with_sign(add(x,y),an);
    int order=compare(x,y);if(order>=0)return with_sign(subtract(x,y),an);return with_sign(subtract(y,x),bn);
}

char *negate(const char *s){if(*s=='-')return copy(s+1);return with_sign(copy(s),1);}

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

int main(void){
    char *line;
    while((line=readLine())!=NULL){
        size_t length=strlen(line);if(length&&line[length-1]=='\r')line[--length]='\0';
        if(!strcmp(line,".")){free(line);break;}
        char **tokens=(char**)malloc((length+1)*sizeof(char*));int count=0;
        for(char *token=strtok(line," \t\r");token;token=strtok(NULL," \t\r"))tokens[count++]=token;
        char **stack=(char**)malloc((count+1)*sizeof(char*));int size=0,valid=1;
        for(int i=count-1;i>=0&&valid;i--){
            char *token=tokens[i];int digits=*token!='\0';
            for(size_t j=0;token[j];j++)if(token[j]<'0'||token[j]>'9')digits=0;
            if(digits){normalize(token);if(!strcmp(token,"0")){valid=0;break;}stack[size++]=copy(token);continue;}
            if(strlen(token)!=1||!strchr("+-*/%",*token)||size<2){valid=0;break;}
            char *a=stack[--size],*b=stack[--size],*result=NULL;
            if(*token=='+')result=signed_add(a,b);
            else if(*token=='-')result=signed_subtract(a,b);
            else if(*token=='*')result=signed_multiply(a,b);
            else{
                if(!strcmp(b,"0"))valid=0;
                else{
                    int an=*a=='-',bn=*b=='-';char *q,*r;unsigned_divide(a+an,b+bn,&q,&r);
                    if(*token=='/'){result=with_sign(q,an!=bn);free(r);}
                    else{result=with_sign(r,an);free(q);}
                }
            }
            free(a);free(b);if(result)stack[size++]=result;
        }
        if(valid&&size==1)puts(stack[0]);else puts("illegal");
        for(int i=0;i<size;i++)free(stack[i]);free(stack);free(tokens);free(line);
    }
    return 0;
}
