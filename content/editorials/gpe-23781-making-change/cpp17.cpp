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

int clipped_stock(const char *text){int value=0;for(size_t i=text[0]=='+';text[i];i++){value=value*10+text[i]-'0';if(value>177)return 177;}return value;}
int minimum(int a,int b){return a<b?a:b;}
int solve(int stock[6],int target){
    int coins[6]={1,2,4,10,20,40};if(target==0)return 0;
    int paid=0,count=0;
    for(int i=5;i>=0;i--){int needed=paid>=target?0:(target-paid+coins[i]-1)/coins[i];int take=minimum(stock[i],needed);paid+=take*coins[i];count+=take;}
    int *change=(int*)malloc((paid-target+1)*sizeof(int));change[0]=0;
    for(int amount=1;amount<=paid-target;amount++){change[amount]=1000000;for(int i=0;i<6;i++)if(coins[i]<=amount)change[amount]=minimum(change[amount],change[amount-coins[i]]+1);}
    int budget=count+change[paid-target],limit=40*budget,infinity=budget+1;free(change);
    int *own=(int*)malloc((limit+1)*sizeof(int)),*shop=(int*)malloc((limit-target+1)*sizeof(int));
    for(int amount=0;amount<=limit;amount++)own[amount]=infinity;own[0]=0;
    for(int i=0;i<6;i++){
        int remaining=minimum(stock[i],budget),chunk=1;
        while(remaining){int take=minimum(chunk,remaining),worth=coins[i]*take;
            for(int amount=limit;amount>=worth;amount--)own[amount]=minimum(own[amount],own[amount-worth]+take);
            remaining-=take;chunk*=2;
        }
    }
    shop[0]=0;
    for(int amount=1;amount<=limit-target;amount++){shop[amount]=infinity;for(int i=0;i<6;i++)if(coins[i]<=amount)shop[amount]=minimum(shop[amount],1+shop[amount-coins[i]]);}
    int answer=budget;for(int amount=target;amount<=limit;amount++)answer=minimum(answer,own[amount]+shop[amount-target]);
    free(own);free(shop);return answer;
}
int main(void){
    while(1){
        char *first=word();if(!first)break;int stocks[6],any=0;stocks[0]=clipped_stock(first);free(first);
        for(int i=1;i<6;i++){char *text=word();stocks[i]=clipped_stock(text);free(text);}
        for(int i=0;i<6;i++)any|=stocks[i];if(!any)break;
        char *price=word(),*point=strchr(price,'.');int cents=100*atoi(price);
        if(point&&point[1]){cents+=10*(point[1]-'0');if(point[2])cents+=point[2]-'0';}
        printf("%3d\n",solve(stocks,cents/5));free(price);
    }
    return 0;
}
