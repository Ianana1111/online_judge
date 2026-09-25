#include <stdio.h>
unsigned long long reverse(unsigned long long value) {
    unsigned long long answer=0;
    while(value) {answer=answer*10+value%10;value/=10;}
    return answer;
}
int main(void) {
    int tests; scanf("%d",&tests);
    while(tests--) {
        unsigned long long value; scanf("%llu",&value);
        int count=0;
        do {value+=reverse(value);++count;} while(value!=reverse(value));
        printf("%d %llu\n",count,value);
    }
    return 0;
}
