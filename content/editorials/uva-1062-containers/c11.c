#include <stdio.h>
#include <string.h>
int main(void) {
    char sequence[1001];int tc=0;
    while(scanf("%1000s",sequence)==1 && strcmp(sequence,"end")!=0) {
        char tops[1001];int size=0;
        for(int i=0;sequence[i];++i) {
            int left=0,right=size;
            while(left<right) {
                int middle=(left+right)/2;
                if(tops[middle]<sequence[i]) left=middle+1;
                else right=middle;
            }
            if(left==size) ++size;
            tops[left]=sequence[i];
        }
        printf("Case %d: %d\n",++tc,size);
    }
    return 0;
}
