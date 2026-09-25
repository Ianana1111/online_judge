#include <stdio.h>
#include <stdlib.h>
typedef struct{int left,right;} Segment;
static int compare(const void*a,const void*b){
 const Segment*x=a,*y=b;
 if(x->left!=y->left)return x->left<y->left?-1:1;
 return x->right<y->right?-1:x->right>y->right?1:0;
}
int main(void){
 int tests;if(scanf("%d",&tests)!=1)return 0;
 for(int tc=0;tc<tests;tc++){
  int target,left,right,n=0,cap=128;
  scanf("%d",&target);Segment*segments=malloc(cap*sizeof(Segment));
  while(scanf("%d %d",&left,&right)==2&&(left||right)){
   if(n==cap){cap*=2;segments=realloc(segments,cap*sizeof(Segment));}
   segments[n++]=(Segment){left,right};
  }
  qsort(segments,n,sizeof(Segment),compare);
  Segment*answer=malloc(n*sizeof(Segment));int used=0,covered=0,at=0;
  while(covered<target){
   int farthest=covered,chosen=-1;
   while(at<n&&segments[at].left<=covered){
    if(segments[at].right>farthest){farthest=segments[at].right;chosen=at;}
    at++;
   }
   if(chosen<0){used=0;break;}
   answer[used++]=segments[chosen];covered=farthest;
  }
  if(tc)putchar('\n');printf("%d\n",used);
  for(int i=0;i<used;i++)printf("%d %d\n",answer[i].left,answer[i].right);
  free(segments);free(answer);
 }
 return 0;
}
