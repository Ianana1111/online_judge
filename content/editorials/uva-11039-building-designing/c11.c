#include <stdio.h>
#include <stdlib.h>
int compare(const void *a,const void *b) {
    int x=*(const int*)a,y=*(const int*)b;
    int ax=abs(x),ay=abs(y);
    return (ax>ay)-(ax<ay);
}
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        int n;scanf("%d",&n);int *floors=malloc((size_t)n*sizeof(int));
        for(int i=0;i<n;++i) scanf("%d",&floors[i]);
        qsort(floors,n,sizeof(int),compare);
        int answer=0,previous=0;
        for(int i=0;i<n;++i) {
            int color=floors[i]>0?1:-1;
            if(color!=previous) {++answer;previous=color;}
        }
        printf("%d\n",answer);free(floors);
    }
    return 0;
}
