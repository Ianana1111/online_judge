#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef struct {long long time;int id,period;} Event;
int earlier(Event a,Event b) {return a.time<b.time || (a.time==b.time && a.id<b.id);}
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        int n,k;scanf("%d %d",&n,&k);
        char names[3001][101];Event heap[3002];int size=0;
        for(int i=0;i<n;++i) {
            int period;scanf("%100s %d",names[i],&period);
            Event event={period,i,period};int pos=++size;
            while(pos>1 && earlier(event,heap[pos/2])) {heap[pos]=heap[pos/2];pos/=2;}
            heap[pos]=event;
        }
        while(k--) {
            Event current=heap[1];printf("%lld %s\n",current.time,names[current.id]);
            current.time+=current.period;
            int pos=1;
            while(pos*2<=size) {
                int child=pos*2;
                if(child<size && earlier(heap[child+1],heap[child])) ++child;
                if(!earlier(heap[child],current)) break;
                heap[pos]=heap[child];pos=child;
            }
            heap[pos]=current;
        }
    }
    return 0;
}
