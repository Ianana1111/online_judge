#include <stdio.h>
#include <string.h>
static char first[6][8],second[6][8],choices[5][27];
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  int k;scanf("%d",&k);
  for(int row=0;row<6;row++)scanf("%7s",first[row]);
  for(int row=0;row<6;row++)scanf("%7s",second[row]);
  int length[5]={0},suffix[6];suffix[5]=1;
  for(int col=0;col<5;col++){
   int a[26]={0},b[26]={0};
   for(int row=0;row<6;row++){a[first[row][col]-'A']=1;b[second[row][col]-'A']=1;}
   for(int c=0;c<26;c++)if(a[c]&&b[c])choices[col][length[col]++]='A'+c;
  }
  for(int col=4;col>=0;col--)suffix[col]=suffix[col+1]*length[col];
  if(k>suffix[0]){puts("NO");continue;}
  int rank=k-1;
  for(int col=0;col<5;col++){
   int block=suffix[col+1];putchar(choices[col][rank/block]);rank%=block;
  }
  putchar('\n');
 }
 return 0;
}
