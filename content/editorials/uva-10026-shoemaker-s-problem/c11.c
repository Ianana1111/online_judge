#include <stdio.h>
#include <stdlib.h>
typedef struct {long long time,fine;int id;} Job;
int compare(const void *a,const void *b) {
    const Job *x=a,*y=b;
    long long left=x->time*y->fine,right=y->time*x->fine;
    if(left!=right) return (left>right)-(left<right);
    return (x->id>y->id)-(x->id<y->id);
}
int main(void) {
    int tests;scanf("%d",&tests);
    for(int tc=0;tc<tests;++tc) {
        int n;scanf("%d",&n);Job *jobs=malloc((size_t)n*sizeof(Job));
        for(int i=0;i<n;++i) {scanf("%lld %lld",&jobs[i].time,&jobs[i].fine);jobs[i].id=i+1;}
        qsort(jobs,n,sizeof(Job),compare);
        if(tc) putchar('\n');
        for(int i=0;i<n;++i) printf("%s%d",i?" ":"",jobs[i].id);
        putchar('\n');free(jobs);
    }
    return 0;
}
