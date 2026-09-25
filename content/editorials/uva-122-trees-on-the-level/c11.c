#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef struct{int child[2];char value[64];}Node;
static Node *nodes;static int used,capacity;
static int add(void){
 if(used==capacity){capacity*=2;nodes=realloc(nodes,(size_t)capacity*sizeof(Node));}
 int id=used++;nodes[id].child[0]=nodes[id].child[1]=-1;nodes[id].value[0]=0;return id;
}
int main(void){
 capacity=512;nodes=malloc((size_t)capacity*sizeof(Node));used=0;add();int valid=1;char token[1024];
 while(scanf("%1023s",token)==1){
  if(strcmp(token,"()")==0){
   int *queue=malloc((size_t)used*sizeof(int)),head=0,tail=0;queue[tail++]=0;
   while(head<tail){int id=queue[head++];if(nodes[id].value[0]==0)valid=0;
    for(int d=0;d<2;d++)if(nodes[id].child[d]>=0)queue[tail++]=nodes[id].child[d];
   }
   if(!valid)puts("not complete");
   else{for(int i=0;i<tail;i++){if(i)putchar(' ');fputs(nodes[queue[i]].value,stdout);}putchar('\n');}
   free(queue);used=0;add();valid=1;continue;
  }
  char *comma=strchr(token,','),*value=token+1;*comma=0;
  while(*value=='0')value++;
  int at=0;
  for(char *step=comma+1;*step&&*step!=')';step++){
   int side=*step=='R',next=nodes[at].child[side];
   if(next<0){next=add();nodes[at].child[side]=next;}at=next;
  }
  if(nodes[at].value[0]!=0)valid=0;
  snprintf(nodes[at].value,sizeof(nodes[at].value),"%s",value);
 }
 free(nodes);return 0;
}
