#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int tests;scanf("%d",&tests);
    for(int tc=1;tc<=tests;++tc) {
        char label,equals;int n;scanf(" %c %c %d",&label,&equals,&n);
        size_t size=(size_t)n*n;long long *values=malloc(size*sizeof(long long));int good=1;
        for(size_t i=0;i<size;++i) {scanf("%lld",&values[i]);if(values[i]<0) good=0;}
        for(size_t i=0;i<size;++i) if(values[i]!=values[size-1-i]) good=0;
        printf("Test #%d: %s\n",tc,good?"Symmetric.":"Non-symmetric.");
        free(values);
    }
    return 0;
}
