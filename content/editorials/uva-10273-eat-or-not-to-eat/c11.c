#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
int gcd(int a,int b){while(b){int t=a%b;a=b;b=t;}return a;}
int main(void){int cases;scanf("%d",&cases);while(cases--){int n,period=1,length[1000];unsigned char milk[1000][10],alive[1000];scanf("%d",&n);for(int i=0;i<n;i++){scanf("%d",&length[i]);period=period/gcd(period,length[i])*length[i];for(int j=0;j<length[i];j++){int value;scanf("%d",&value);milk[i][j]=(unsigned char)value;}alive[i]=1;}
    uint16_t *order=(uint16_t*)malloc((size_t)period*n*sizeof(uint16_t));int *first=(int*)calloc(period,sizeof(int)),*second=(int*)malloc(period*sizeof(int));
    for(int phase=0;phase<period;phase++){int count[251]={0},offset[251],sum=0;for(int i=0;i<n;i++)count[milk[i][phase%length[i]]]++;for(int v=0;v<=250;v++){offset[v]=sum;sum+=count[v];}for(int i=0;i<n;i++)order[phase*n+offset[milk[i][phase%length[i]]]++]=(uint16_t)i;second[phase]=1;}
    int day=0,last=0,idle=0,remaining=n;while(remaining&&idle<period){int phase=day%period,*a=&first[phase],*b=&second[phase];uint16_t *row=order+phase*n;while(*a<n&&!alive[row[*a]])(*a)++;if(*b<*a+1)*b=*a+1;while(*b<n&&!alive[row[*b]])(*b)++;int cow=row[*a];day++;
        if(*b==n||milk[cow][phase%length[cow]]<milk[row[*b]][phase%length[row[*b]]]){alive[cow]=0;remaining--;last=day;idle=0;}else idle++;}
    printf("%d %d\n",remaining,last);free(order);free(first);free(second);
}return 0;}
