#include <stdio.h>
int main(void) {
    int tests; scanf("%d",&tests);
    for(int tc=0;tc<tests;++tc) {
        int makers; scanf("%d",&makers);
        char name[10000][101]; int low[10000],high[10000];
        for(int i=0;i<makers;++i) scanf("%100s %d %d",name[i],&low[i],&high[i]);
        if(tc) putchar('\n');
        int queries; scanf("%d",&queries);
        while(queries--) {
            int price,matches=0,answer=0; scanf("%d",&price);
            for(int i=0;i<makers;++i) if(low[i]<=price && price<=high[i]) {++matches;answer=i;}
            puts(matches==1?name[answer]:"UNDETERMINED");
        }
    }
    return 0;
}
