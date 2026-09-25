#include <stdio.h>
#include <stdlib.h>
typedef struct{int x,height,delta;}Event;
static int compare_event(const void *left,const void *right){int a=((const Event*)left)->x,b=((const Event*)right)->x;return (a>b)-(a<b);}
static int compare_int(const void *left,const void *right){int a=*(const int*)left,b=*(const int*)right;return (a>b)-(a<b);}
static int lower_bound(const int *values,int n,int wanted){int lo=0,hi=n;while(lo<hi){int mid=lo+(hi-lo)/2;if(values[mid]<wanted)lo=mid+1;else hi=mid;}return lo;}
int main(void){
 Event *events=NULL;int *heights=NULL,size=0,capacity=0,left,height,right;
 while(scanf("%d %d %d",&left,&height,&right)==3){
  if(size+2>capacity){capacity=capacity?capacity*2:128;events=realloc(events,(size_t)capacity*sizeof(Event));heights=realloc(heights,(size_t)capacity*sizeof(int));}
  events[size]=(Event){left,height,1};heights[size++]=height;
  events[size]=(Event){right,height,-1};heights[size++]=height;
 }
 qsort(events,size,sizeof(Event),compare_event);qsort(heights,size,sizeof(int),compare_int);
 int unique=0;for(int i=0;i<size;i++)if(i==0||heights[i]!=heights[i-1])heights[unique++]=heights[i];
 int *active=calloc((size_t)(unique?unique:1),sizeof(int)),max_index=-1,previous=0,first=1;
 for(int at=0;at<size;){int x=events[at].x;
  while(at<size&&events[at].x==x){int index=lower_bound(heights,unique,events[at].height);
   active[index]+=events[at].delta;if(active[index]>0&&index>max_index)max_index=index;at++;
  }
  while(max_index>=0&&active[max_index]==0)max_index--;
  int current=max_index<0?0:heights[max_index];
  if(current!=previous){if(!first)putchar(' ');printf("%d %d",x,current);first=0;previous=current;}
 }
 putchar('\n');free(events);free(heights);free(active);return 0;
}
