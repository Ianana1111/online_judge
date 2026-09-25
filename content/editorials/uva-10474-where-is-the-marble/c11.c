#include <stdio.h>
#include <stdlib.h>
int compare(const void *a,const void *b) {int x=*(const int*)a,y=*(const int*)b;return (x>y)-(x<y);}
int main(void) {
    int n,q,tc=0;
    while(scanf("%d %d",&n,&q)==2 && (n||q)) {
        int *marbles=malloc((size_t)n*sizeof(int));
        for(int i=0;i<n;++i) scanf("%d",&marbles[i]);
        qsort(marbles,n,sizeof(int),compare);
        printf("CASE# %d:\n",++tc);
        while(q--) {
            int value;scanf("%d",&value);
            int left=0,right=n;
            while(left<right) {
                int middle=(left+right)/2;
                if(marbles[middle]<value) left=middle+1;
                else right=middle;
            }
            if(left<n && marbles[left]==value) printf("%d found at %d\n",value,left+1);
            else printf("%d not found\n",value);
        }
        free(marbles);
    }
    return 0;
}
