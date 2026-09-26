#include <stdio.h>
#include <string.h>
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
void add_small(Big *a,unsigned int value){Big b=number(value);add(a,&b);}
int compare(Big a,Big b){
    if(a.length!=b.length)return a.length>b.length?1:-1;
    for(int i=a.length-1;i>=0;i--)if(a.digit[i]!=b.digit[i])return a.digit[i]>b.digit[i]?1:-1;
    return 0;
}
void subtract(Big *a,const Big *b){
    long long borrow=0;
    for(int i=0;i<a->length;i++){long long value=(long long)a->digit[i]-(i<b->length?b->digit[i]:0)-borrow;borrow=value<0;if(borrow)value+=(long long)BASE;a->digit[i]=(unsigned int)value;}
    trim(a);
}
Big multiply(Big a,Big b){
    Big result={{0},a.length+b.length};
    for(int i=0;i<a.length;i++){
        unsigned long long carry=0;
        for(int j=0;j<b.length;j++){unsigned long long current=(unsigned long long)a.digit[i]*b.digit[j]+result.digit[i+j]+carry;result.digit[i+j]=(unsigned int)(current%BASE);carry=current/BASE;}
        int at=i+b.length;
        while(carry){unsigned long long current=result.digit[at]+carry;result.digit[at++]=(unsigned int)(current%BASE);carry=current/BASE;}
    }
    trim(&result);return result;
}
void print_big(Big a){printf("%u",a.digit[a.length-1]);for(int i=a.length-2;i>=0;i--)printf("%09u",a.digit[i]);putchar('\n');}

int main(void){
    char text[112];
    while(scanf("%111s",text)==1){
        if(strcmp(text,"0")==0)break;
        int size=(int)strlen(text),at=0;Big root=number(0),remainder=number(0);
        while(at<size){
            int take=(at==0&&size%2)?1:2,value=0;
            for(int i=0;i<take;i++)value=10*value+text[at++]-'0';
            multiply_small(&remainder,100);add_small(&remainder,value);
            int digit=9;Big trial;
            for(;digit>=0;digit--){trial=root;multiply_small(&trial,20);add_small(&trial,digit);multiply_small(&trial,digit);if(compare(trial,remainder)<=0)break;}
            subtract(&remainder,&trial);multiply_small(&root,10);add_small(&root,digit);
        }
        print_big(multiply(root,root));
    }
    return 0;
}
