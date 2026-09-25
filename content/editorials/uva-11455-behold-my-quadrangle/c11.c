#include <stdio.h>
int main(void) {
    int tests; scanf("%d", &tests);
    while(tests--) {
        long long a[4];
        for(int i=0;i<4;++i) scanf("%lld", &a[i]);
        for(int i=0;i<4;++i) for(int j=i+1;j<4;++j)
            if(a[j]<a[i]) {long long temp=a[i]; a[i]=a[j]; a[j]=temp;}
        if(a[0]==a[3]) puts("square");
        else if(a[0]==a[1] && a[2]==a[3]) puts("rectangle");
        else if(a[0]+a[1]+a[2]>a[3]) puts("quadrangle");
        else puts("banana");
    }
    return 0;
}
