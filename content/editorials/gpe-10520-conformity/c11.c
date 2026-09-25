#include <stdio.h>
#include <stdlib.h>
typedef struct {int course[5];} Choice;
int integer_compare(const void *a,const void *b) {
    int x=*(const int*)a,y=*(const int*)b;return (x>y)-(x<y);
}
int choice_compare(const void *a,const void *b) {
    const Choice *x=a,*y=b;
    for(int i=0;i<5;++i) if(x->course[i]!=y->course[i])
        return (x->course[i]>y->course[i])-(x->course[i]<y->course[i]);
    return 0;
}
int main(void) {
    int n;
    while(scanf("%d",&n)==1 && n) {
        Choice *choices=malloc((size_t)n*sizeof(Choice));
        for(int i=0;i<n;++i) {
            for(int j=0;j<5;++j) scanf("%d",&choices[i].course[j]);
            qsort(choices[i].course,5,sizeof(int),integer_compare);
        }
        qsort(choices,n,sizeof(Choice),choice_compare);
        int best=0,answer=0;
        for(int i=0;i<n;) {
            int end=i+1;
            while(end<n && choice_compare(&choices[i],&choices[end])==0) ++end;
            int count=end-i;
            if(count>best) {best=count;answer=count;}
            else if(count==best) answer+=count;
            i=end;
        }
        printf("%d\n",answer);free(choices);
    }
    return 0;
}
