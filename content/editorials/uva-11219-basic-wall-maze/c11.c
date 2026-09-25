#include <stdio.h>
static void date(int *day,int *month,int *year){scanf("%d/%d/%d",day,month,year);}
int main(void){
 int cases;if(scanf("%d",&cases)!=1)return 0;
 for(int t=1;t<=cases;t++){
  int cd,cm,cy,bd,bm,by;date(&cd,&cm,&cy);date(&bd,&bm,&by);
  printf("Case #%d: ",t);
  if(by>cy||(by==cy&&(bm>cm||(bm==cm&&bd>cd)))){puts("Invalid birth date");continue;}
  int age=cy-by-((cm<bm)||(cm==bm&&cd<bd));
  if(age>130)puts("Check birth date");else printf("%d\n",age);
 }
 return 0;
}
