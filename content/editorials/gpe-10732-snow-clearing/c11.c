#include <math.h>
#include <stdio.h>
#include <string.h>
int main(void){
 char line[256];int tests;
 if(!fgets(line,sizeof(line),stdin)||sscanf(line,"%d",&tests)!=1)return 0;
 for(int t=0;t<tests;t++){
  while(fgets(line,sizeof(line),stdin)&&strspn(line," \t\r\n")==strlen(line)){}
  long double x,y;sscanf(line,"%Lf %Lf",&x,&y);
  long double distance=0;
  while(fgets(line,sizeof(line),stdin)){
   if(strspn(line," \t\r\n")==strlen(line))break;
   long double x1,y1,x2,y2;
   if(sscanf(line,"%Lf %Lf %Lf %Lf",&x1,&y1,&x2,&y2)==4)distance+=hypotl(x2-x1,y2-y1);
  }
  long long minutes=(long long)floorl(distance*6.0L/1000.0L+0.5L);
  if(t)putchar('\n');printf("%lld:%02lld\n",minutes/60,minutes%60);
 }
 return 0;
}
