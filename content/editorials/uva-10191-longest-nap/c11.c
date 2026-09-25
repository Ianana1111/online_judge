#include <stdio.h>
#include <stdlib.h>
typedef struct{int start,end;} Appointment;
static Appointment times[101];
static int compare(const void*a,const void*b){
 int x=((const Appointment*)a)->start,y=((const Appointment*)b)->start;return x<y?-1:x>y?1:0;
}
int main(void){
 int n,day=0;char line[1024];
 while(scanf("%d",&n)==1){
  fgets(line,sizeof(line),stdin);
  for(int i=0;i<n;i++){
   fgets(line,sizeof(line),stdin);
   int sh,sm,eh,em;sscanf(line,"%d:%d %d:%d",&sh,&sm,&eh,&em);
   times[i]=(Appointment){sh*60+sm,eh*60+em};
  }
  times[n]=(Appointment){1080,1080};qsort(times,n+1,sizeof(Appointment),compare);
  int cursor=600,bestStart=600,longest=0;
  for(int i=0;i<=n;i++){
   int gap=times[i].start-cursor;
   if(gap>longest){longest=gap;bestStart=cursor;}
   if(times[i].end>cursor)cursor=times[i].end;
  }
  printf("Day #%d: the longest nap starts at %02d:%02d and will last for ",++day,bestStart/60,bestStart%60);
  if(longest>=60)printf("%d hours and ",longest/60);
  printf("%d minutes.\n",longest%60);
 }
 return 0;
}
