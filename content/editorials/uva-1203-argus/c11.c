#include <stdio.h>
#include <string.h>
typedef struct {long long time;int id,period;} Event;
int earlier(Event a,Event b) {return a.time<b.time || (a.time==b.time && a.id<b.id);}
int main(void) {
    Event heap[3001];int size=0;char command[16];
    while(scanf("%15s",command)==1 && strcmp(command,"#")!=0) {
        int id,period;scanf("%d %d",&id,&period);
        Event event={period,id,period};int pos=++size;
        while(pos>1 && earlier(event,heap[pos/2])) {heap[pos]=heap[pos/2];pos/=2;}
        heap[pos]=event;
    }
    int k;scanf("%d",&k);
    while(k--) {
        Event event=heap[1];printf("%d\n",event.id);
        event.time+=event.period;int pos=1;
        while(pos*2<=size) {
            int child=pos*2;
            if(child<size && earlier(heap[child+1],heap[child])) ++child;
            if(!earlier(heap[child],event)) break;
            heap[pos]=heap[child];pos=child;
        }
        heap[pos]=event;
    }
    return 0;
}
