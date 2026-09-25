#include <stdio.h>
#include <string.h>
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int length,words;scanf("%d %d",&length,&words);
  char previous[101],next[101];scanf("%100s",previous);int answer=length;
  for(int i=1;i<words;i++){
   scanf("%100s",next);int overlap=length;
   while(overlap>0&&strncmp(previous+length-overlap,next,overlap)!=0)overlap--;
   answer+=length-overlap;strcpy(previous,next);
  }
  printf("%d\n",answer);
 }
 return 0;
}
