#include <stdio.h>
typedef unsigned __int128 Number;
void print_number(Number value) {
    if(value>=10) print_number(value/10);
    putchar('0'+(int)(value%10));
}
int main(void) {
    int n;
    while(scanf("%d",&n)==1) {
        Number previous=1,current=1;
        for(int step=2;step<=n;++step) {
            Number next=previous+current;previous=current;current=next;
        }
        print_number(current);putchar('\n');
    }
    return 0;
}
