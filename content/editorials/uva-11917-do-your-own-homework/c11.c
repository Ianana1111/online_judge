#include <stdio.h>
#include <string.h>
int main(void) {
    int tests; scanf("%d", &tests);
    for(int tc=1;tc<=tests;++tc) {
        int n, day[101]; char subjects[101][101];
        scanf("%d", &n);
        for(int i=0;i<n;++i) scanf("%100s %d", subjects[i], &day[i]);
        int deadline; char wanted[101];
        scanf("%d %100s", &deadline, wanted);
        int finish=1000000000;
        for(int i=0;i<n;++i) if(strcmp(subjects[i],wanted)==0) finish=day[i];
        const char *result=finish<=deadline ? "Yesss" : finish<=deadline+5 ? "Late" : "Do your own homework!";
        printf("Case %d: %s\n", tc, result);
    }
    return 0;
}
