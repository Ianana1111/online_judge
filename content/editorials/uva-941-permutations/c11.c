#include <stdio.h>
#include <string.h>
static long long factorial[21];
int main(void){
 factorial[0]=1;for(int i=1;i<=20;i++)factorial[i]=factorial[i-1]*i;
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  char word[32];long long rank;scanf("%31s %lld",word,&rank);
  int count[26]={0},length=strlen(word);for(int i=0;i<length;i++)count[word[i]-'a']++;
  for(int remaining=length;remaining>0;remaining--){
   for(int ch=0;ch<26;ch++)if(count[ch]){
    count[ch]--;long long ways=factorial[remaining-1];
    for(int i=0;i<26;i++)ways/=factorial[count[i]];
    if(rank<ways){putchar('a'+ch);break;}
    rank-=ways;count[ch]++;
   }
  }
  putchar('\n');
 }
 return 0;
}
