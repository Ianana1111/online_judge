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

typedef struct{char *rows,*columns;} Matrix;
int main(void){
    char *token=word();if(!token)return 0;int n=atoi(token);free(token);Matrix dimensions[26];int listed[26]={0};
    for(int i=0;i<n;i++){token=word();int name=*token-'A';free(token);listed[name]=1;dimensions[name].rows=normalize(word());dimensions[name].columns=normalize(word());}
    char *expression;
    while((expression=word())!=NULL){
        size_t length=strlen(expression);Matrix *stack=(Matrix*)malloc((length+1)*sizeof(Matrix));size_t size=0;int valid=1;char *cost=copy("0");
        for(size_t i=0;i<length;i++){
            char symbol=expression[i];if(symbol=='(')continue;
            if(symbol==')'){
                Matrix right=stack[--size],left=stack[--size];
                if(strcmp(left.columns,right.rows)){valid=0;break;}
                char *first=unsigned_multiply(left.rows,left.columns),*product=unsigned_multiply(first,right.columns),*next=add(cost,product);
                free(first);free(product);free(cost);cost=next;stack[size++]=(Matrix){left.rows,right.columns};
            }else stack[size++]=dimensions[symbol-'A'];
        }
        puts(valid?cost:"error");free(cost);free(stack);free(expression);
    }
    for(int i=0;i<26;i++)if(listed[i]){free(dimensions[i].rows);free(dimensions[i].columns);}
    return 0;
}
