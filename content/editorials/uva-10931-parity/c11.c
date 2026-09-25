#include <stdio.h>
int main(void) {
    unsigned int value;
    while(scanf("%u",&value)==1 && value) {
        char bits[33]; int length=0, ones=0; unsigned int current=value;
        while(current) {bits[length++]=(char)('0'+current%2); ones+=current%2; current/=2;}
        printf("The parity of ");
        for(int i=length-1;i>=0;--i) putchar(bits[i]);
        printf(" is %d (mod 2).\n",ones);
    }
    return 0;
}
