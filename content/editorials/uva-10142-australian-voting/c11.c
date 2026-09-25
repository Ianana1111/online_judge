#include <stdio.h>
#include <stdlib.h>
#include <string.h>
static char names[20][1024];static int ballots[1000][20];
static void trim(char *line){size_t length=strlen(line);while(length&&(line[length-1]=='\n'||line[length-1]=='\r'))line[--length]=0;}
int main(void){
 char line[4096];if(!fgets(line,sizeof(line),stdin))return 0;int tests=atoi(line);
 for(int test=0;test<tests;test++){
  do{if(!fgets(line,sizeof(line),stdin))return 0;trim(line);}while(!line[0]);
  int n=atoi(line);for(int i=0;i<n;i++){fgets(names[i],sizeof(names[i]),stdin);trim(names[i]);}
  int count=0;
  while(fgets(line,sizeof(line),stdin)){trim(line);if(!line[0])break;
   char *at=line;for(int i=0;i<n;i++){ballots[count][i]=(int)strtol(at,&at,10)-1;}count++;
  }
  int alive[20],winners[20],winner_count=0;for(int i=0;i<n;i++)alive[i]=1;
  while(!winner_count){
   int votes[20]={0};
   for(int b=0;b<count;b++)for(int rank=0;rank<n;rank++){int id=ballots[b][rank];if(alive[id]){votes[id]++;break;}}
   int least=count+1,most=0;
   for(int i=0;i<n;i++)if(alive[i]){if(votes[i]<least)least=votes[i];if(votes[i]>most)most=votes[i];}
   if(2*most>count){for(int i=0;i<n;i++)if(alive[i]&&votes[i]==most)winners[winner_count++]=i;}
   else if(least==most){for(int i=0;i<n;i++)if(alive[i])winners[winner_count++]=i;}
   else for(int i=0;i<n;i++)if(alive[i]&&votes[i]==least)alive[i]=0;
  }
  if(test)putchar('\n');for(int i=0;i<winner_count;i++)puts(names[winners[i]]);
 }
 return 0;
}
