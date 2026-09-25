#include <stdio.h>
#include <stdlib.h>
typedef struct {int start,finish;} Event;
int compare(const void *a,const void *b) {
    const Event *x=a,*y=b;
    return (x->finish>y->finish)-(x->finish<y->finish);
}
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        Event events[10000];int count=0,start,finish;
        while(scanf("%d %d",&start,&finish)==2 && (start||finish)) events[count++]=(Event){start,finish};
        qsort(events,count,sizeof(Event),compare);
        int end=0,answer=0;
        for(int i=0;i<count;++i) if(events[i].start>=end) {++answer;end=events[i].finish;}
        printf("%d\n",answer);
    }
    return 0;
}
