#include <ctype.h>
#include <stdio.h>
#include <string.h>
static char standard[100][256],team[100][256],visibleStandard[13000],visibleTeam[13000];
static void trim(char*s){size_t n=strlen(s);while(n&&(s[n-1]=='\n'||s[n-1]=='\r'))s[--n]=0;}
static void readLines(char lines[][256],int count){
 for(int i=0;i<count;i++){
  fgets(lines[i],256,stdin);trim(lines[i]);
 }
}
static void visible(char lines[][256],int count,char*out){
 int at=0;
 for(int i=0;i<count;i++)for(int j=0;lines[i][j];j++){
  unsigned char ch=lines[i][j];if(!isspace(ch))out[at++]=ch;
 }
 out[at]=0;
}
int main(void){
 int n,m,run=0;char rest[256];
 while(scanf("%d",&n)==1&&n){
  fgets(rest,sizeof(rest),stdin);readLines(standard,n);
  scanf("%d",&m);fgets(rest,sizeof(rest),stdin);readLines(team,m);
  int exact=n==m;size_t characters=0;
  for(int i=0;i<n;i++){
   characters+=strlen(standard[i]);
   if(i<m&&strcmp(standard[i],team[i])!=0)exact=0;
  }
  const char*verdict;
  if(exact)verdict="Accepted";
  else{
   visible(standard,n,visibleStandard);visible(team,m,visibleTeam);
   verdict=strcmp(visibleStandard,visibleTeam)==0?"Presentation Error":"Wrong Answer";
  }
  printf("Run #%d: %s %zu\n",++run,verdict,characters);
 }
 return 0;
}
