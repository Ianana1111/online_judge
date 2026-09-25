#include <stdio.h>
#include <string.h>
int digit(char ch) {
    if(ch>='0' && ch<='9') return ch-'0';
    if(ch>='A' && ch<='Z') return ch-'A'+10;
    return ch-'a'+36;
}
int main(void) {
    char text[100001];
    while(scanf("%100000s",text)==1) {
        long long sum=0;int maximum=0;
        for(size_t i=0;text[i];++i) {
            char ch=text[i];if(ch=='+' || ch=='-') continue;
            int value=digit(ch);sum+=value;if(value>maximum) maximum=value;
        }
        int answer=-1;
        for(int base=maximum+1;base<=62;++base) {
            if(base<2) continue;
            if(sum%(base-1)==0) {answer=base;break;}
        }
        if(answer<0) puts("such number is impossible!");
        else printf("%d\n",answer);
    }
    return 0;
}
