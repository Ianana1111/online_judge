#include <stdio.h>
typedef struct{int source,start,duration,target;}Request;
static Request requests[10000];static unsigned char seen[10000];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;puts("CALL FORWARDING OUTPUT");
 for(int system=1;system<=tests;system++){
  int count=0,source;
  while(scanf("%d",&source)==1&&source){
   Request *request=&requests[count++];request->source=source;
   scanf("%d %d %d",&request->start,&request->duration,&request->target);
  }
  printf("SYSTEM %d\n",system);int time,extension;
  while(scanf("%d",&time)==1&&time!=9000){
   scanf("%d",&extension);int current=extension;
   for(int i=0;i<10000;i++)seen[i]=0;
   while(1){
    if(seen[current]){current=9999;break;}seen[current]=1;
    int next=-1;
    for(int i=0;i<count;i++)if(requests[i].source==current&&requests[i].start<=time&&time<=requests[i].start+requests[i].duration){next=requests[i].target;break;}
    if(next<0)break;current=next;
   }
   printf("AT %04d CALL TO %04d RINGS %04d\n",time,extension,current);
  }
 }
 puts("END OF OUTPUT");return 0;
}
