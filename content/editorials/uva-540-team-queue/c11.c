#include <stdio.h>
#include <string.h>
static int owner[1000000],head[1000],tail[1000],active[200001];
static int value[200001],next[200001];
int main(void){
 int teams,scenario=0;
 while(scanf("%d",&teams)==1&&teams){
  for(int t=0;t<teams;t++){
   int count;scanf("%d",&count);
   while(count--){int member;scanf("%d",&member);owner[member]=t;}
   head[t]=tail[t]=0;
  }
  printf("Scenario #%d\n",++scenario);
  int front=0,back=0,nodes=0;char command[16];
  while(scanf("%15s",command)==1&&strcmp(command,"STOP")!=0){
   if(command[0]=='E'){
    int member;scanf("%d",&member);int team=owner[member],node=++nodes;
    value[node]=member;next[node]=0;
    if(head[team]==0){head[team]=node;active[back++]=team;}
    else next[tail[team]]=node;
    tail[team]=node;
   }else{
    int team=active[front],node=head[team];printf("%d\n",value[node]);
    head[team]=next[node];if(head[team]==0){tail[team]=0;front++;}
   }
  }
  putchar('\n');
 }
 return 0;
}
