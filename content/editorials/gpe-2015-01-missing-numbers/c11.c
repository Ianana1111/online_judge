#include <stdio.h>
int main(void) {
    int lists,size;
    if(scanf("%d %d",&lists,&size)!=2) return 0;
    long long previous=0;
    for(int i=0;i<lists;++i) {
        long long current=0,value;
        for(int j=0;j<size-i;++j) {scanf("%lld",&value);current^=value;}
        if(i) printf("%lld\n",previous^current);
        previous=current;
    }
    return 0;
}
