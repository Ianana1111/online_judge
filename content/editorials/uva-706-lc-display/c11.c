#include <stdio.h>
#include <string.h>
int main(void){
 const int mask[10]={0x3f,0x06,0x5b,0x4f,0x66,0x6d,0x7d,0x07,0x7f,0x6f};
 int size;char number[16];
 while(scanf("%d %15s",&size,number)==2&&!(size==0&&strcmp(number,"0")==0)){
  int length=(int)strlen(number);
  for(int row=0;row<2*size+3;row++){
   for(int index=0;index<length;index++){
    if(index)putchar(' ');int segments=mask[number[index]-'0'];
    if(row==0||row==size+1||row==2*size+2){
     int bit=row==0?0:row==size+1?6:3;putchar(' ');
     for(int col=0;col<size;col++)putchar(segments&(1<<bit)?'-':' ');putchar(' ');
    }else{
     int upper=row<size+1,left=upper?5:4,right=upper?1:2;
     putchar(segments&(1<<left)?'|':' ');
     for(int col=0;col<size;col++)putchar(' ');
     putchar(segments&(1<<right)?'|':' ');
    }
   }
   putchar('\n');
  }
  putchar('\n');
 }
 return 0;
}
