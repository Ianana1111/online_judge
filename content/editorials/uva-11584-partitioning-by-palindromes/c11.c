#include <stdio.h>
#include <string.h>
static unsigned char palindrome[1000][1000];static int groups[1001];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  char s[1001];scanf("%1000s",s);int n=strlen(s);
  for(int left=n-1;left>=0;left--)for(int right=left;right<n;right++)
   palindrome[left][right]=s[left]==s[right]&&(right-left<2||palindrome[left+1][right-1]);
  groups[0]=0;
  for(int end=1;end<=n;end++){
   groups[end]=n+1;
   for(int begin=0;begin<end;begin++)if(palindrome[begin][end-1]&&groups[begin]+1<groups[end])
    groups[end]=groups[begin]+1;
  }
  printf("%d\n",groups[n]);
 }
 return 0;
}
