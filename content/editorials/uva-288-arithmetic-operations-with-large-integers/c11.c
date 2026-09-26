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

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}
char *normalize(char *text){size_t first=0;while(text[first]=='0'&&text[first+1])first++;if(first)memmove(text,text+first,strlen(text+first)+1);return text;}

char *unsigned_multiply(const char *a,const char *b){
    size_t n=strlen(a),m=strlen(b);unsigned char *digit=(unsigned char*)calloc(n+m,1);
    for(size_t i=0;i<n;i++){
        int carry=0;
        for(size_t j=0;j<m;j++){int value=digit[i+j]+(a[n-1-i]-'0')*(b[m-1-j]-'0')+carry;digit[i+j]=(unsigned char)(value%10);carry=value/10;}
        size_t at=i+m;while(carry){int value=digit[at]+carry;digit[at++]=(unsigned char)(value%10);carry=value/10;}
    }
    char *result=(char*)malloc(n+m+1);for(size_t i=0;i<n+m;i++)result[n+m-1-i]=(char)('0'+digit[i]);result[n+m]='\0';free(digit);return normalize(result);
}

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

char *power(const char *base,const char *exponent){
    if(!strcmp(base,"1"))return copy("1");
    /* For base >= 2, the 3000-digit intermediate cap bounds this exponent. */
    unsigned int remaining=(unsigned int)strtoul(exponent,NULL,10);char *value=copy(base),*result=copy("1");
    while(remaining){
        if(remaining&1){char *next=unsigned_multiply(result,value);free(result);result=next;}
        remaining>>=1;if(remaining){char *next=unsigned_multiply(value,value);free(value);value=next;}
    }
    free(value);return result;
}
void collapse(char **values,char *operators,int *count,int index,char *result){
    free(values[index]);free(values[index+1]);values[index]=result;
    for(int i=index+1;i<*count;i++)values[i]=values[i+1];
    for(int i=index;i+1<*count;i++)operators[i]=operators[i+1];(*count)--;
}
int main(void){
    char *line;
    while((line=readLine())!=NULL){
        char *values[101];char operators[100];int number_count=0,operator_count=0;size_t at=0;
        while(line[at]){
            if(line[at]<=' '){at++;continue;}
            if(line[at]>='0'&&line[at]<='9'){
                size_t first=at;while(line[at]>='0'&&line[at]<='9')at++;
                char *value=(char*)malloc(at-first+1);memcpy(value,line+first,at-first);value[at-first]='\0';values[number_count++]=normalize(value);
            }else{
                char op=line[at++];if(op=='*'&&line[at]=='*'){op='^';at++;}operators[operator_count++]=op;
            }
        }
        if(!number_count){free(line);continue;}
        for(int i=operator_count-1;i>=0;i--)if(operators[i]=='^')collapse(values,operators,&operator_count,i,power(values[i],values[i+1]));
        for(int i=0;i<operator_count;)if(operators[i]=='*')collapse(values,operators,&operator_count,i,unsigned_multiply(values[i],values[i+1]));else i++;
        char *answer=copy(values[0]);
        for(int i=0;i<operator_count;i++){char *next=operators[i]=='+'?signed_add(answer,values[i+1]):signed_subtract(answer,values[i+1]);free(answer);answer=next;}
        puts(answer);free(answer);for(int i=0;i<=operator_count;i++)free(values[i]);free(line);
    }
    return 0;
}
