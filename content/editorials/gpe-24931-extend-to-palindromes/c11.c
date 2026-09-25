#include <stdio.h>
#include <string.h>
static char text[100001],joined[200002];static int prefix[200002];
int main(void){
 while(scanf("%100000s",text)==1){
  int n=strlen(text);
  for(int i=0;i<n;i++)joined[i]=text[n-1-i];
  joined[n]='#';memcpy(joined+n+1,text,n);int total=2*n+1;
  prefix[0]=0;
  for(int i=1;i<total;i++){
   int length=prefix[i-1];
   while(length>0&&joined[i]!=joined[length])length=prefix[length-1];
   if(joined[i]==joined[length])length++;
   prefix[i]=length;
  }
  int suffix=prefix[total-1];fputs(text,stdout);
  for(int i=n-suffix-1;i>=0;i--)putchar(text[i]);
  putchar('\n');
 }
 return 0;
}
