#include <stdio.h>
#include <string.h>
int main(void) {
    int n,tc=0;
    while(scanf("%d",&n)==1) {
        int answer=0;
        while(n--) {
            char word[1001];int count[26]={0},distinct=0,unique=1;
            scanf("%1000s",word);
            for(size_t i=0;word[i];++i) ++count[word[i]-'a'];
            for(int a=0;a<26;++a) if(count[a]) {
                ++distinct;
                for(int b=0;b<a;++b) if(count[b]==count[a]) unique=0;
            }
            if(distinct>=2 && unique) ++answer;
        }
        printf("Case %d: %d\n",++tc,answer);
    }
    return 0;
}
