#include <stdio.h>
#include <stdlib.h>
typedef struct {long long from,to;} Pair;
int compare(const void *a,const void *b) {
    const Pair *x=a,*y=b;
    if(x->from!=y->from) return (x->from>y->from)-(x->from<y->from);
    return (x->to>y->to)-(x->to<y->to);
}
int main(void) {
    int n;
    while(scanf("%d",&n)==1 && n) {
        Pair *forward=malloc((size_t)n*sizeof(Pair)),*backward=malloc((size_t)n*sizeof(Pair));
        for(int i=0;i<n;++i) {
            scanf("%lld %lld",&forward[i].from,&forward[i].to);
            backward[i]=(Pair){forward[i].to,forward[i].from};
        }
        qsort(forward,n,sizeof(Pair),compare);qsort(backward,n,sizeof(Pair),compare);
        int good=1;
        for(int i=0;i<n;++i)
            if(forward[i].from!=backward[i].from || forward[i].to!=backward[i].to) good=0;
        puts(good?"YES":"NO");
        free(forward);free(backward);
    }
    return 0;
}
