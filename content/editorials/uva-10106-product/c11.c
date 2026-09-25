#include <stdio.h>
#include <string.h>
int main(void){
 char a[260],b[260];
 while(scanf("%259s %259s",a,b)==2){
  int na=strlen(a),nb=strlen(b),digits[520]={0};
  for(int i=na-1;i>=0;i--)for(int j=nb-1;j>=0;j--)
   digits[i+j+1]+=(a[i]-'0')*(b[j]-'0');
  for(int i=na+nb-1;i>0;i--){digits[i-1]+=digits[i]/10;digits[i]%=10;}
  int first=0;while(first+1<na+nb&&digits[first]==0)first++;
  for(int i=first;i<na+nb;i++)putchar('0'+digits[i]);putchar('\n');
 }
 return 0;
}
