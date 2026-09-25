#include <stdio.h>
#include <string.h>
#define MASK 1023
int main(void){
 char name[100],line[32];
 while(scanf("%99s",name)==1&&strcmp(name,"end")!=0){
  int lights[10]={0};
  for(int row=0;row<10;row++){
   scanf("%31s",line);
   for(int col=0;col<10;col++)if(line[col]=='O')lights[row]|=1<<col;
  }
  int best=101;
  for(int first=0;first<1024;first++){
   int previous=0,press=first,count=0;
   for(int row=0;row<10;row++){
    count+=__builtin_popcount((unsigned)press);
    int next=lights[row]^press^((press<<1)&MASK)^(press>>1)^previous;
    previous=press;press=next;
   }
   if(press==0&&count<best)best=count;
  }
  printf("%s %d\n",name,best<=100?best:-1);
 }
 return 0;
}
