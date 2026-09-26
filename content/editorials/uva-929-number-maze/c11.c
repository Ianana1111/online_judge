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
        int rows,cols;scanf("%d%d",&rows,&cols);int count=rows*cols;
        unsigned char *weight=malloc(count);int *distance=malloc(count*sizeof(int));
        for(int i=0;i<count;i++){int value;scanf("%d",&value);weight[i]=(unsigned char)value;distance[i]=INT_MAX;}
        Heap heap={0};distance[0]=weight[0];push(&heap,(long long)distance[0]*count);
        int dr[4]={1,0,-1,0},dc[4]={0,1,0,-1};
        while(heap.size){
            long long entry=pop(&heap);int cost=(int)(entry/count),node=(int)(entry%count);
            if(cost!=distance[node])continue;
            if(node==count-1)break;
            int row=node/cols,col=node%cols;
            for(int d=0;d<4;d++){
                int r=row+dr[d],c=col+dc[d];if(r<0||r>=rows||c<0||c>=cols)continue;
                int next=r*cols+c,candidate=cost+weight[next];
                if(candidate<distance[next]){distance[next]=candidate;push(&heap,(long long)candidate*count+next);}
            }
        }
        printf("%d\n",distance[count-1]);free(weight);free(distance);free(heap.data);
    }
    return 0;
}
