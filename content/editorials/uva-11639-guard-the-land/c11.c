#include <stdio.h>

static int minimum(int a, int b) { return a < b ? a : b; }
static int maximum(int a, int b) { return a > b ? a : b; }

int main(void) {
    int tests;
    if (scanf("%d", &tests) != 1) return 0;
    for (int case_number = 1; case_number <= tests; ++case_number) {
        int a,b,c,d,e,f,g,h;
        scanf("%d %d %d %d %d %d %d %d", &a,&b,&c,&d,&e,&f,&g,&h);
        int area_a = (c-a)*(d-b), area_b = (g-e)*(h-f);
        int width = maximum(0, minimum(c,g)-maximum(a,e));
        int height = maximum(0, minimum(d,h)-maximum(b,f));
        int strong = width*height;
        int weak = area_a+area_b-2*strong;
        int none = 10000-strong-weak;
        printf("Night %d: %d %d %d\n", case_number, strong, weak, none);
    }
    return 0;
}
