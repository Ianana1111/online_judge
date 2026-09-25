#include <stdio.h>
static char first[2000],second[2000];
static unsigned char black[32][32];
static void paint(const char*tree,int*position,int row,int col,int side){
 char kind=tree[(*position)++];
 if(kind=='f'){
  for(int r=row;r<row+side;r++)for(int c=col;c<col+side;c++)black[r][c]=1;
 }else if(kind=='p'){
  int half=side/2;
  paint(tree,position,row,col+half,half);
  paint(tree,position,row,col,half);
  paint(tree,position,row+half,col,half);
  paint(tree,position,row+half,col+half,half);
 }
}
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 while(tests--){
  scanf("%1999s %1999s",first,second);
  for(int r=0;r<32;r++)for(int c=0;c<32;c++)black[r][c]=0;
  int position=0;paint(first,&position,0,0,32);
  position=0;paint(second,&position,0,0,32);
  int count=0;for(int r=0;r<32;r++)for(int c=0;c<32;c++)count+=black[r][c];
  printf("There are %d black pixels.\n",count);
 }
 return 0;
}
