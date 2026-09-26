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
char *normalize(char *text){size_t first=0;while(text[first]=='0'&&text[first+1])first++;if(first)memmove(text,text+first,strlen(text+first)+1);return text;}
char *add(const char *a,const char *b){
    size_t x=strlen(a),y=strlen(b),size=(x>y?x:y)+1;
    char *result=(char*)malloc(size+1);result[size]='\0';int carry=0;
    for(size_t i=0;i<size;i++){int value=carry+(i<x?a[x-1-i]-'0':0)+(i<y?b[y-1-i]-'0':0);result[size-1-i]=(char)('0'+value%10);carry=value/10;}
    return normalize(result);
}

char *with_sign(char *magnitude,int negative){
    if(negative&&strcmp(magnitude,"0")){size_t n=strlen(magnitude);magnitude=(char*)realloc(magnitude,n+2);memmove(magnitude+1,magnitude,n+1);magnitude[0]='-';}return magnitude;
}

char *negate(const char *s){if(*s=='-')return copy(s+1);return with_sign(copy(s),1);}
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

char *distance[51][51],*saving[51],*cost[13][13],*profit[13],**memo;int stores[13],k,states;
char *money(void){char *s=word(),*at=s,*to=s;while(*at){if(*at!='.'&&*at!='+')*to++=*at;at++;}*to='\0';return normalize(s);}
int number(void){char *s=word();int n=atoi(s);free(s);return n;}
int signed_compare(char *a,char *b){int an=*a=='-',bn=*b=='-';if(an!=bn)return an?-1:1;int c=compare(a+an,b+bn);return an?-c:c;}
char *best(int mask,int current){int key=current*states+mask;if(memo[key])return memo[key];char *answer=negate(cost[current][0]);for(int i=1;i<=k;i++){int bit=1<<(i-1);if(mask&bit)continue;char *gain=signed_subtract(profit[i],cost[current][i]),*candidate=signed_add(gain,best(mask|bit,i));free(gain);if(signed_compare(candidate,answer)>0){free(answer);answer=candidate;}else free(candidate);}return memo[key]=answer;}
int main(void){int cases=number();while(cases--){int n=number(),m=number();memset(distance,0,sizeof(distance));memset(saving,0,sizeof(saving));for(int i=0;i<=n;i++)distance[i][i]=copy("0");for(int i=0;i<m;i++){int u=number(),v=number();char *value=money();if(!distance[u][v]||compare(value,distance[u][v])<0){free(distance[u][v]);distance[u][v]=copy(value);if(u!=v){free(distance[v][u]);distance[v][u]=copy(value);}}free(value);}
    for(int mid=0;mid<=n;mid++)for(int u=0;u<=n;u++)if(distance[u][mid])for(int v=0;v<=n;v++)if(distance[mid][v]){char *candidate=add(distance[u][mid],distance[mid][v]);if(!distance[u][v]||compare(candidate,distance[u][v])<0){free(distance[u][v]);distance[u][v]=candidate;}else free(candidate);}
    int offers=number();for(int i=0;i<offers;i++){int store=number();char *amount=money();if(saving[store]){char *sum=add(saving[store],amount);free(saving[store]);free(amount);saving[store]=sum;}else saving[store]=amount;}
    stores[0]=0;k=0;for(int i=0;i<=n;i++)if(saving[i]){stores[++k]=i;profit[k]=saving[i];}for(int i=0;i<=k;i++)for(int j=0;j<=k;j++)cost[i][j]=distance[stores[i]][stores[j]];
    states=1<<k;memo=(char**)calloc((k+1)*states,sizeof(char*));char *amount=best(0,0);if(*amount=='-'||strcmp(amount,"0")==0)puts("Don't leave the house");else{size_t len=strlen(amount);printf("Daniel can save $");if(len<=2)printf("0.%s%s\n",len==1?"0":"",amount);else{fwrite(amount,1,len-2,stdout);printf(".%s\n",amount+len-2);}}
    for(int i=0;i<(k+1)*states;i++)free(memo[i]);free(memo);for(int i=0;i<=n;i++){free(saving[i]);for(int j=0;j<=n;j++)free(distance[i][j]);}
}return 0;}
