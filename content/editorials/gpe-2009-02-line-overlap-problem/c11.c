#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef struct {long long position;int change;} Event;
int compare(const void *a,const void *b) {
    const Event *x=a,*y=b;
    if(x->position!=y->position) return (x->position>y->position)-(x->position<y->position);
    return x->change-y->change;
}
int main(void) {
    char line[1000];Event *events=NULL;int count=0,capacity=0;
    while(fgets(line,sizeof(line),stdin) && strcmp(line,".\n")!=0 && strcmp(line,".")!=0) {
        long long left,right;
        if(sscanf(line,"%lld %lld",&left,&right)!=2) continue;
        if(count+2>capacity) {capacity=capacity?capacity*2:32;events=realloc(events,(size_t)capacity*sizeof(Event));}
        events[count++]=(Event){left,1};events[count++]=(Event){right,-1};
    }
    qsort(events,count,sizeof(Event),compare);
    long long active=0,answer=0,previous=count?events[0].position:0;
    for(int i=0;i<count;++i) {
        answer+=(events[i].position-previous)*(active*(active-1)/2);
        active+=events[i].change;previous=events[i].position;
    }
    printf("%lld\n",answer);free(events);
    return 0;
}
