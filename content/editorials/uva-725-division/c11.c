#include <stdio.h>
int unique_digits(int numerator,int denominator) {
    int used=0;
    for(int part=0;part<2;++part) {
        int value=part?denominator:numerator;
        for(int i=0;i<5;++i) {
            int bit=1<<(value%10);value/=10;
            if(used&bit) return 0;
            used|=bit;
        }
    }
    return used==(1<<10)-1;
}
int main(void) {
    int n,first=1;
    while(scanf("%d",&n)==1 && n) {
        if(!first) putchar('\n');first=0;int found=0;
        for(int denominator=1234;denominator*n<=98765;++denominator) {
            int numerator=denominator*n;
            if(!unique_digits(numerator,denominator)) continue;
            found=1;printf("%05d / %05d = %d\n",numerator,denominator,n);
        }
        if(!found) printf("There are no solutions for %d.\n",n);
    }
    return 0;
}
