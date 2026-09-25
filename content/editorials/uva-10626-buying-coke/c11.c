#include <stdio.h>
#include <stdlib.h>
static int total_c,total_value,max_five,max_ten,*memo;
static int solve(int remaining,int fives,int tens){
 if(remaining==0)return 0;
 int index=(remaining*(max_five+1)+fives)*(max_ten+1)+tens;
 if(memo[index]>=0)return memo[index];
 int ones=total_value-8*(total_c-remaining)-5*fives-10*tens,answer=1000000,candidate;
 if(ones>=8){candidate=8+solve(remaining-1,fives,tens);if(candidate<answer)answer=candidate;}
 if(fives>=1&&ones>=3){candidate=4+solve(remaining-1,fives-1,tens);if(candidate<answer)answer=candidate;}
 if(fives>=2){candidate=2+solve(remaining-1,fives-2,tens);if(candidate<answer)answer=candidate;}
 if(tens>=1){candidate=1+solve(remaining-1,fives,tens-1);if(candidate<answer)answer=candidate;}
 if(tens>=1&&ones>=3){candidate=4+solve(remaining-1,fives+1,tens-1);if(candidate<answer)answer=candidate;}
 return memo[index]=answer;
}
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int ones,fives,tens;scanf("%d %d %d %d",&total_c,&ones,&fives,&tens);
  total_value=ones+5*fives+10*tens;max_five=fives+tens;max_ten=tens;
  size_t size=(size_t)(total_c+1)*(max_five+1)*(max_ten+1);memo=malloc(size*sizeof(int));
  for(size_t i=0;i<size;i++)memo[i]=-1;
  printf("%d\n",solve(total_c,fives,tens));free(memo);
 }
 return 0;
}
