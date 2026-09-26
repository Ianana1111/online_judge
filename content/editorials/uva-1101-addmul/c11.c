#include <stdio.h>
#include <limits.h>
typedef long long Integer;
typedef struct {char operation;Integer count;} Run;
typedef struct {Run runs[64];int size;Integer length;} Program;
void append(Program *p,char op,Integer count){if(!count)return;p->length+=count;if(p->size&&p->runs[p->size-1].operation==op)p->runs[p->size-1].count+=count;else p->runs[p->size++]=(Run){op,count};}
int less(Program *a,Program *b){int i=0,j=0;Integer x=0,y=0;while(i<a->size&&j<b->size){if(a->runs[i].operation!=b->runs[j].operation)return a->runs[i].operation<b->runs[j].operation;Integer take=a->runs[i].count-x;if(b->runs[j].count-y<take)take=b->runs[j].count-y;x+=take;y+=take;if(x==a->runs[i].count){i++;x=0;}if(y==b->runs[j].count){j++;y=0;}}return i==a->size&&j<b->size;}
int main(void){Integer a,m,p,q,r,s;int tc=0;while(scanf("%lld%lld%lld%lld%lld%lld",&a,&m,&p,&q,&r,&s)==6&&a){Integer powers[32]={1};Program best={{{0,0}},0,LLONG_MAX};
    for(int k=0;q*powers[k]<=s;k++){Integer need=r-p*powers[k],low=need>0?(need+a-1)/a:0,high=(s-q*powers[k])/a;
        for(int j=0;j<=k&&low<=high;j++){Integer value=(low+powers[j]-1)/powers[j]*powers[j];if(value>high)continue;Program candidate={{{0,0}},0,0};Integer rest=value;
            for(int pos=k;pos>=0;pos--){Integer count=rest/powers[pos];rest%=powers[pos];append(&candidate,'A',count);if(pos)append(&candidate,'M',1);}
            if(candidate.length<best.length||(candidate.length==best.length&&less(&candidate,&best)))best=candidate;
        }
        if(m==1||powers[k]>s/m)break;powers[k+1]=powers[k]*m;
    }
    printf("Case %d: ",++tc);if(best.length==LLONG_MAX)puts("impossible");else if(!best.size)puts("empty");else {for(int i=0;i<best.size;i++)printf("%s%lld%c",i?" ":"",best.runs[i].count,best.runs[i].operation);putchar('\n');}
}return 0;}
