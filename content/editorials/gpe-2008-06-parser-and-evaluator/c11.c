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

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}

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

char *values[1024];char operators[1024];int value_count,operator_count;
int priority(char op){return op=='P'||op=='N'?4:op=='%'?3:op=='*'||op=='/'?2:1;}
int apply(void){char op=operators[--operator_count];if(op=='P'||op=='N'){if(!value_count)return 0;if(op=='N'){char *next=negate(values[value_count-1]);free(values[value_count-1]);values[value_count-1]=next;}return 1;}if(op=='('||value_count<2)return 0;char *b=values[--value_count],*a=values[--value_count],*result=NULL;
    if(op=='+')result=signed_add(a,b);else if(op=='-')result=signed_subtract(a,b);else if(op=='*')result=signed_multiply(a,b);else if(strcmp(b,"0")){int an=*a=='-',bn=*b=='-';char *q,*r;unsigned_divide(a+an,b+bn,&q,&r);if(op=='/'){result=with_sign(q,an!=bn);free(r);}else{result=with_sign(r,an);free(q);}}
    free(a);free(b);if(!result)return 0;values[value_count++]=result;return 1;
}
char *evaluate(char *line){value_count=operator_count=0;int expecting=1,valid=1;size_t at=0;while(line[at]&&valid){unsigned char ch=(unsigned char)line[at];if(isspace(ch)){at++;continue;}if(ch>='0'&&ch<='9'){if(!expecting){valid=0;break;}size_t begin=at;while(line[at]>='0'&&line[at]<='9')at++;char *number=(char*)malloc(at-begin+1);memcpy(number,line+begin,at-begin);number[at-begin]='\0';values[value_count++]=signed_normalize(number);expecting=0;continue;}
    at++;if(ch=='('){if(!expecting){valid=0;break;}operators[operator_count++]='(';}
    else if(ch==')'){if(expecting){valid=0;break;}while(operator_count&&operators[operator_count-1]!='('&&valid)valid=apply();if(!valid||!operator_count){valid=0;break;}operator_count--;expecting=0;}
    else if(ch=='+'||ch=='-'||ch=='*'||ch=='/'||ch=='%'){if(expecting){if(ch!='+'&&ch!='-'){valid=0;break;}operators[operator_count++]=ch=='+'?'P':'N';}else{while(operator_count&&operators[operator_count-1]!='('&&priority(operators[operator_count-1])>=priority((char)ch)&&valid)valid=apply();if(!valid)break;operators[operator_count++]=(char)ch;expecting=1;}}
    else valid=0;
}
    if(expecting)valid=0;while(valid&&operator_count)valid=apply();char *answer=NULL;if(valid&&value_count==1){answer=values[0];value_count=0;}while(value_count)free(values[--value_count]);return answer;
}
int main(void){char *line;int tc=0;while((line=readLine())!=NULL){char *answer=evaluate(line);printf("case %d:\n%s\n\n",++tc,answer?answer:"syntactically incorrect");free(answer);free(line);}return 0;}
