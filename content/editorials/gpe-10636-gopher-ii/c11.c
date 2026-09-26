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
char *normalize(char *text){size_t first=0;while(text[first]=='0'&&text[first+1])first++;if(first)memmove(text,text+first,strlen(text+first)+1);return text;}

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

int adjacent[99][99],owner[99],seen[99],holes;
int augment(int gopher){
    for(int hole=0;hole<holes;hole++)if(adjacent[gopher][hole]&&!seen[hole]){
        seen[hole]=1;if(owner[hole]<0||augment(owner[hole])){owner[hole]=gopher;return 1;}
    }
    return 0;
}
char *decimal(char *text,long *scale){
    char *exponent=strchr(text,'e');if(!exponent)exponent=strchr(text,'E');long power=0;
    if(exponent){power=strtol(exponent+1,NULL,10);*exponent='\0';}
    size_t size=strlen(text),used=0;char *result=(char*)malloc(size+2);int after=0;long places=0;
    for(size_t i=0;i<size;i++){if(text[i]=='.'){after=1;continue;}result[used++]=text[i];if(after)places++;}
    result[used]='\0';*scale=places-power;return signed_normalize(result);
}
char *pad(char *text,long zeros){
    if(!strcmp(text,"0"))return text;size_t size=strlen(text);text=(char*)realloc(text,size+(size_t)zeros+1);
    memset(text+size,'0',(size_t)zeros);text[size+(size_t)zeros]='\0';return text;
}
int main(void){
    char *token;
    while((token=word())!=NULL){
        int n=atoi(token);free(token);token=word();holes=atoi(token);free(token);token=word();int seconds=atoi(token);free(token);token=word();int speed=atoi(token);free(token);
        int count=2*(n+holes);char *coordinates[396];long scales[396],common=0;
        for(int i=0;i<count;i++){token=word();coordinates[i]=decimal(token,&scales[i]);free(token);if(scales[i]>common)common=scales[i];}
        for(int i=0;i<count;i++)coordinates[i]=pad(coordinates[i],common-scales[i]);
        char digits[16];snprintf(digits,sizeof(digits),"%d",seconds*speed);char *reach=pad(copy(digits),common),*limit=unsigned_multiply(reach,reach);free(reach);
        for(int i=0;i<n;i++)for(int j=0;j<holes;j++){
            char *dx=signed_subtract(coordinates[2*i],coordinates[2*(n+j)]),*dy=signed_subtract(coordinates[2*i+1],coordinates[2*(n+j)+1]);
            char *xx=signed_multiply(dx,dx),*yy=signed_multiply(dy,dy),*distance=add(xx,yy);
            adjacent[i][j]=compare(distance,limit)<=0;free(dx);free(dy);free(xx);free(yy);free(distance);
        }
        for(int j=0;j<holes;j++)owner[j]=-1;int saved=0;
        for(int i=0;i<n;i++){memset(seen,0,sizeof(seen));saved+=augment(i);}
        printf("%d\n",n-saved);free(limit);for(int i=0;i<count;i++)free(coordinates[i]);
    }
    return 0;
}
