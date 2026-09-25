#include <stdio.h>
int main(void) {
    int fib[50]={1,2}, count=2;
    while(fib[count-1]<100000000) {fib[count]=fib[count-1]+fib[count-2];++count;}
    int tests; scanf("%d", &tests);
    while(tests--) {
        int original, remaining, started=0;
        scanf("%d", &original); remaining=original;
        printf("%d = ", original);
        for(int i=count-1;i>=0;--i) {
            if(fib[i]<=remaining) {putchar('1');remaining-=fib[i];started=1;}
            else if(started) putchar('0');
        }
        puts(" (fib)");
    }
    return 0;
}
