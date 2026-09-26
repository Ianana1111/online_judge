#include <stdio.h>
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
int compare(Big a,Big b){
    if(a.length!=b.length)return a.length>b.length?1:-1;
    for(int i=a.length-1;i>=0;i--)if(a.digit[i]!=b.digit[i])return a.digit[i]>b.digit[i]?1:-1;
    return 0;
}

int main(void){
    int k,n;
    while(scanf("%d%d",&k,&n)==2){
        Big counts[10],following[10],denominator=number(1);
        for(int d=0;d<=k;d++)counts[d]=number(1);
        for(int length=2;length<=n;length++){
            for(int d=0;d<=k;d++){
                following[d]=number(0);int low=d>0?d-1:0,high=d<k?d+1:k;
                for(int previous=low;previous<=high;previous++)add(&following[d],&counts[previous]);
            }
            for(int d=0;d<=k;d++)counts[d]=following[d];
        }
        for(int length=0;length<n;length++)multiply_small(&denominator,k+1);
        Big numerator=number(0);for(int d=0;d<=k;d++)add(&numerator,&counts[d]);
        multiply_small(&numerator,20000000);add(&numerator,&denominator);multiply_small(&denominator,2);
        int low=0,high=10000000;
        while(low<high){int middle=(low+high+1)/2;Big candidate=denominator;multiply_small(&candidate,middle);if(compare(candidate,numerator)<=0)low=middle;else high=middle-1;}
        printf("%d.%05d\n",low/100000,low%100000);
    }
    return 0;
}
