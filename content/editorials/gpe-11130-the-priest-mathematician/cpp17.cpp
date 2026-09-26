#include <cstdio>
using namespace std;
#define BASE 1000000000ULL
#define WORDS 128
/* The reviewed bounds require fewer than 1152 decimal digits. */
typedef struct { unsigned int digit[WORDS]; int length; } Big;
Big number(unsigned int value){Big a={{0},1};a.digit[0]=value;return a;}
void trim(Big *a){while(a->length>1&&a->digit[a->length-1]==0)a->length--;}
void multiply_small(Big *a,unsigned int value){
    unsigned long long carry=0;
    for(int i=0;i<a->length;i++){unsigned long long current=(unsigned long long)a->digit[i]*value+carry;a->digit[i]=(unsigned int)(current%BASE);carry=current/BASE;}
    while(carry){a->digit[a->length++]=(unsigned int)(carry%BASE);carry/=BASE;}
    trim(a);
}
void add(Big *a,const Big *b){
    int size=a->length>b->length?a->length:b->length;unsigned long long carry=0;
    for(int i=0;i<size;i++){unsigned long long value=carry+(i<a->length?a->digit[i]:0)+(i<b->length?b->digit[i]:0);a->digit[i]=(unsigned int)(value%BASE);carry=value/BASE;}
    a->length=size;if(carry)a->digit[a->length++]=(unsigned int)carry;
}
void print_big(Big a){printf("%u",a.digit[a.length-1]);for(int i=a.length-2;i>=0;i--)printf("%09u",a.digit[i]);putchar('\n');}

int main(void){
    static Big moves[10001];moves[0]=number(0);Big increment=number(1);
    int block=1,left=1;
    for(int n=1;n<=10000;n++){
        moves[n]=moves[n-1];add(&moves[n],&increment);
        if(--left==0){multiply_small(&increment,2);left=++block;}
    }
    int n;while(scanf("%d",&n)==1)print_big(moves[n]);return 0;
}
