#include <stdio.h>
#include <string.h>
static char line[1024],plain[1024],sub[1024];
static void trim(char*s){size_t n=strlen(s);while(n&&(s[n-1]=='\n'||s[n-1]=='\r'))s[--n]=0;}
int main(void){
 if(!fgets(line,sizeof(line),stdin))return 0;int tests=0;sscanf(line,"%d",&tests);
 for(int tc=0;tc<tests;tc++){
  do{if(!fgets(plain,sizeof(plain),stdin))return 0;trim(plain);}while(plain[0]==0);
  if(!fgets(sub,sizeof(sub),stdin))return 0;trim(sub);
  unsigned char map[256];for(int i=0;i<256;i++)map[i]=i;
  for(size_t i=0;i<strlen(plain);i++)map[(unsigned char)plain[i]]=(unsigned char)sub[i];
  if(tc)putchar('\n');printf("%s\n%s\n",sub,plain);
  while(fgets(line,sizeof(line),stdin)){
   trim(line);if(line[0]==0)break;
   for(size_t i=0;i<strlen(line);i++)putchar(map[(unsigned char)line[i]]);
   putchar('\n');
  }
 }
 return 0;
}
