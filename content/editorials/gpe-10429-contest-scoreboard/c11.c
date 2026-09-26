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

char *penalty[101];int solved[101];
int blank(const char *s){while(*s){if(!isspace((unsigned char)*s))return 0;s++;}return 1;}
int compare_team(const void *left,const void *right){
    int a=*(const int*)left,b=*(const int*)right;if(solved[a]!=solved[b])return solved[b]-solved[a];
    int an=*penalty[a]=='-',bn=*penalty[b]=='-';if(an!=bn)return an?-1:1;
    int order=compare(penalty[a]+an,penalty[b]+bn);if(an)order=-order;return order?order:a-b;
}
int main(void){
    char *line=readLine();if(!line)return 0;int tests=atoi(line);free(line);
    for(int test=0;test<tests;test++){
        int active[101]={0},accepted[101][10]={{0}};unsigned long long wrong[101][10]={{0}};
        for(int i=1;i<=100;i++){solved[i]=0;penalty[i]=copy("0");}
        while((line=readLine())!=NULL&&blank(line))free(line);
        while(line&&!blank(line)){
            int team=atoi(strtok(line," \t\r")),problem=atoi(strtok(NULL," \t\r"));
            char *minute=signed_normalize(strtok(NULL," \t\r"));char verdict=*strtok(NULL," \t\r");active[team]=1;
            if(!accepted[team][problem]){
                if(verdict=='I')wrong[team][problem]++;
                else if(verdict=='C'){
                    accepted[team][problem]=1;solved[team]++;char extra[32];snprintf(extra,sizeof(extra),"%llu",20*wrong[team][problem]);
                    char *cost=signed_add(minute,extra),*next=signed_add(penalty[team],cost);free(cost);free(penalty[team]);penalty[team]=next;
                }
            }
            free(line);line=readLine();
        }
        free(line);int teams[100],count=0;for(int i=1;i<=100;i++)if(active[i])teams[count++]=i;
        qsort(teams,count,sizeof(int),compare_team);if(test)putchar('\n');
        for(int i=0;i<count;i++){int team=teams[i];printf("%d %d %s\n",team,solved[team],penalty[team]);}
        for(int i=1;i<=100;i++)free(penalty[i]);
    }
    return 0;
}
