#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int compare(const void *a,const void *b) {return *(const char*)a-*(const char*)b;}
int main(void) {
    long long original;
    while(scanf("%lld",&original)==1 && original) {
        printf("Original number was %lld\n",original);
        long long seen[1000],current=original;int used=1,length=0;seen[0]=original;
        for(;;) {
            char digits[32];sprintf(digits,"%lld",current);
            int size=(int)strlen(digits);qsort(digits,size,sizeof(char),compare);
            long long low=atoll(digits);
            for(int i=0;i<size/2;++i) {char t=digits[i];digits[i]=digits[size-1-i];digits[size-1-i]=t;}
            long long high=atoll(digits),next=high-low;++length;
            printf("%lld - %lld = %lld\n",high,low,next);
            int repeated=0;
            for(int i=0;i<used;++i) if(seen[i]==next) repeated=1;
            if(repeated) break;
            seen[used++]=next;current=next;
        }
        printf("Chain length %d\n\n",length);
    }
    return 0;
}
