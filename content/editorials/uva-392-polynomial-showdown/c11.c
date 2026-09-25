#include <stdio.h>
#include <stdlib.h>
int main(void){
 int c[9];
 while(scanf("%d",&c[0])==1){
  for(int i=1;i<9;i++)scanf("%d",&c[i]);
  int first=1;
  for(int i=0;i<9;i++){
   int value=c[i],degree=8-i;
   if(value==0)continue;
   if(first){if(value<0)putchar('-');}
   else printf(value<0?" - ":" + ");
   int magnitude=abs(value);
   if(degree==0||magnitude!=1)printf("%d",magnitude);
   if(degree>0){putchar('x');if(degree>1)printf("^%d",degree);}
   first=0;
  }
  if(first)putchar('0');putchar('\n');
 }
 return 0;
}
