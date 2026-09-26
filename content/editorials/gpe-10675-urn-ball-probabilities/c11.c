#include <stdio.h>
#include <stdlib.h>
#include <math.h>
typedef struct { int n,index; } Query;
int compare(const void *a,const void *b){const Query *x=a,*y=b;return (x->n>y->n)-(x->n<y->n);}
void accumulate(double value,double *sum,double *error){double corrected=value-*error,next=*sum+corrected;*error=(next-*sum)-corrected;*sum=next;}
int main(void){
    Query *queries=NULL;int size=0,capacity=0,n;
    while(scanf("%d",&n)==1){if(size==capacity){capacity=capacity?2*capacity:16;queries=realloc(queries,capacity*sizeof(Query));}queries[size]=(Query){n,size};size++;}
    qsort(queries,size,sizeof(Query),compare);
    double *probability=malloc(size*sizeof(double));long long *zeroes=malloc(size*sizeof(long long));
    int step=0;double survival=0,factorial=0,survival_error=0,factorial_error=0;
    for(int i=0;i<size;i++){
        n=queries[i].n;
        while(step<n){double k=++step;accumulate(log1p(-1/(k*(k+1))),&survival,&survival_error);accumulate(log10(k),&factorial,&factorial_error);}
        probability[queries[i].index]=n==0?0:-expm1(survival);
        zeroes[queries[i].index]=n==0?0:(long long)floor(2*factorial+log10((double)n+1));
    }
    for(int i=0;i<size;i++)printf("%.6f %lld\n",probability[i],zeroes[i]);
    free(queries);free(probability);free(zeroes);return 0;
}
