#include <stdio.h>
#include <stdlib.h>
long long floor_div(long long a,long long b){long long q=a/b;return q-(a%b<0);}
int better(long long x,long long y,long long bx,long long by){
    long long first=llabs(x)+llabs(y),second=llabs(bx)+llabs(by);
    if(first!=second)return first<second;
    if((x>y)!=(bx>by))return x<=y;
    return x!=bx?x<bx:y<by;
}
int main(void){
    long long a,b;
    while(scanf("%lld%lld",&a,&b)==2){
        long long r0=a,r1=b,x0=1,x1=0,y0=0,y1=1;
        while(r1){
            long long q=r0/r1,r2=r0-q*r1,x2=x0-q*x1,y2=y0-q*y1;
            r0=r1;r1=r2;x0=x1;x1=x2;y0=y1;y1=y2;
        }
        long long sx=b/r0,sy=a/r0,kx=floor_div(-x0,sx),ky=floor_div(y0,sy);
        long long shifts[5]={0,kx,kx+1,ky,ky+1},bx=x0,by=y0;
        for(int i=0;i<5;i++){
            long long x=x0+shifts[i]*sx,y=y0-shifts[i]*sy;
            if(better(x,y,bx,by)){bx=x;by=y;}
        }
        printf("%lld %lld %lld\n",bx,by,r0);
    }
    return 0;
}
