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
char *add(const char *a,const char *b){
    size_t x=strlen(a),y=strlen(b),size=(x>y?x:y)+1;
    char *result=(char*)malloc(size+1);result[size]='\0';int carry=0;
    for(size_t i=0;i<size;i++){int value=carry+(i<x?a[x-1-i]-'0':0)+(i<y?b[y-1-i]-'0':0);result[size-1-i]=(char)('0'+value%10);carry=value/10;}
    return normalize(result);
}

char *copy(const char *s){char *result=(char*)malloc(strlen(s)+1);strcpy(result,s);return result;}

typedef struct {char *name,*digits;int scale;} Entry;
char *decimal(char *s,int *scale){int exponent=0;char *e=strchr(s,'e');if(!e)e=strchr(s,'E');if(e){exponent=atoi(e+1);*e='\0';}char *digits=(char*)malloc(strlen(s)+1);int count=0,fraction=0,after=0;for(char *p=s;*p;p++){if(*p=='.'){after=1;continue;}if(*p>='0'&&*p<='9'){digits[count++]=*p;if(after)fraction++;}}digits[count]='\0';normalize(digits);*scale=fraction-exponent;return digits;}
char *pad(char *s,int zeros){size_t n=strlen(s);s=(char*)realloc(s,n+zeros+1);memset(s+n,'0',zeros);s[n+zeros]='\0';return normalize(s);}
int compare_entry(const void *a,const void *b){return strcmp(((const Entry*)a)->name,((const Entry*)b)->name);}
char *lookup(Entry *entries,int n,const char *name){int l=0,r=n;while(l<r){int m=(l+r)/2;if(strcmp(entries[m].name,name)<0)l=m+1;else r=m;}return l<n&&strcmp(entries[l].name,name)==0?entries[l].digits:NULL;}
void print_decimal(char *s,int scale){size_t n=strlen(s);if(!scale){puts(s);return;}if(n<=(size_t)scale){char *p=(char*)malloc(scale+2);int zeros=scale+1-(int)n;memset(p,'0',zeros);strcpy(p+zeros,s);s=p;n=scale+1;}else s=copy(s);int whole=(int)n-scale;while((int)n>whole&&s[n-1]=='0')n--;fwrite(s,1,whole,stdout);if((int)n>whole){putchar('.');fwrite(s+whole,1,n-whole,stdout);}putchar('\n');free(s);}
int main(void){char *token=word();if(!token)return 0;int m=atoi(token);free(token);token=word();int n=atoi(token);free(token);Entry *entries=(Entry*)malloc(m*sizeof(Entry));int scale=0;for(int i=0;i<m;i++){entries[i].name=word();token=word();entries[i].digits=decimal(token,&entries[i].scale);free(token);if(entries[i].scale>scale)scale=entries[i].scale;}for(int i=0;i<m;i++)entries[i].digits=pad(entries[i].digits,scale-entries[i].scale);qsort(entries,m,sizeof(Entry),compare_entry);
    for(int i=0;i<n;i++){char *sum=copy("0");while((token=word())!=NULL){if(strcmp(token,".")==0){free(token);break;}char *value=lookup(entries,m,token);if(value){char *next=add(sum,value);free(sum);sum=next;}free(token);}print_decimal(sum,scale);free(sum);}for(int i=0;i<m;i++){free(entries[i].name);free(entries[i].digits);}free(entries);return 0;}
