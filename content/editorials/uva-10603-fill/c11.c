#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
typedef struct { long long *data; int size, capacity; } Heap;
void push(Heap *h,long long value){
    if(h->size==h->capacity){h->capacity=h->capacity?2*h->capacity:1024;h->data=realloc(h->data,h->capacity*sizeof(long long));}
    int at=h->size++;
    while(at>0){int parent=(at-1)/2;if(h->data[parent]<=value)break;h->data[at]=h->data[parent];at=parent;}
    h->data[at]=value;
}
long long pop(Heap *h){
    long long answer=h->data[0],value=h->data[--h->size];int at=0;
    while(2*at+1<h->size){
        int child=2*at+1;if(child+1<h->size&&h->data[child+1]<h->data[child])child++;
        if(h->data[child]>=value)break;h->data[at]=h->data[child];at=child;
    }
    if(h->size)h->data[at]=value;
    return answer;
}

int main(void){
    int tests;scanf("%d",&tests);
    while(tests--){
        int cap[3],target;scanf("%d%d%d%d",&cap[0],&cap[1],&cap[2],&target);
        int width=cap[1]+1,count=(cap[0]+1)*width;
        int *distance=malloc(count*sizeof(int)),best[201];
        for(int i=0;i<count;i++)distance[i]=INT_MAX;
        for(int i=0;i<=200;i++)best[i]=INT_MAX;
        Heap heap={0};distance[0]=0;push(&heap,0);
        while(heap.size){
            long long entry=pop(&heap);int cost=(int)(entry/count),node=(int)(entry%count);
            if(distance[node]!=cost)continue;
            int water[3]={node/width,node%width,cap[2]-node/width-node%width};
            for(int i=0;i<3;i++)if(cost<best[water[i]])best[water[i]]=cost;
            for(int from=0;from<3;from++)for(int to=0;to<3;to++)if(from!=to){
                int amount=water[from]<cap[to]-water[to]?water[from]:cap[to]-water[to];
                if(!amount)continue;
                int next[3]={water[0],water[1],water[2]};next[from]-=amount;next[to]+=amount;
                int id=next[0]*width+next[1],candidate=cost+amount;
                if(candidate<distance[id]){distance[id]=candidate;push(&heap,(long long)candidate*count+id);}
            }
        }
        for(int volume=target;volume>=0;volume--)if(best[volume]!=INT_MAX){printf("%d %d\n",best[volume],volume);break;}
        free(distance);free(heap.data);
    }
    return 0;
}
