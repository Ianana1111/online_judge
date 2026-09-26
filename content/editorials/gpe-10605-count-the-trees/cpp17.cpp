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
void divide_small(Big *a,unsigned int value){
    unsigned long long remainder=0;
    for(int i=a->length-1;i>=0;i--){unsigned long long current=remainder*BASE+a->digit[i];a->digit[i]=(unsigned int)(current/value);remainder=current%value;}
    trim(a);
}
void print_big(Big a){printf("%u",a.digit[a.length-1]);for(int i=a.length-2;i>=0;i--)printf("%09u",a.digit[i]);putchar('\n');}

int main(void){
    static Big count[301];count[0]=number(1);
    for(int n=1;n<=300;n++){count[n]=count[n-1];multiply_small(&count[n],4*n-2);multiply_small(&count[n],n);divide_small(&count[n],n+1);}
    int n;while(scanf("%d",&n)==1&&n)print_big(count[n]);return 0;
}
