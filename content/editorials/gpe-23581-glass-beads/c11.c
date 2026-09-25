#include <stdio.h>
#include <string.h>
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  char s[10001];scanf("%10000s",s);int n=strlen(s),i=0,j=1,k=0;
  while(i<n&&j<n&&k<n){
   char a=s[(i+k)%n],b=s[(j+k)%n];
   if(a==b){k++;continue;}
   if(a>b){i+=k+1;if(i==j)i++;}
   else{j+=k+1;if(i==j)j++;}
   k=0;
  }
  printf("%d\n",(i<j?i:j)+1);
 }
 return 0;
}
