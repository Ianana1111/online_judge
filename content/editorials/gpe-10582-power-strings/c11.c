#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int main(void) {
    char *s=malloc(1000002);int *prefix=malloc(1000001*sizeof(int));
    while(fgets(s,1000002,stdin)) {
        int n=(int)strlen(s);
        while(n && (s[n-1]=='\n'||s[n-1]=='\r')) s[--n]='\0';
        if(strcmp(s,".")==0) break;
        prefix[0]=0;
        for(int i=1;i<n;++i) {
            int length=prefix[i-1];
            while(length && s[i]!=s[length]) length=prefix[length-1];
            if(s[i]==s[length]) ++length;
            prefix[i]=length;
        }
        int period=n-prefix[n-1];
        printf("%d\n",n%period==0?n/period:1);
    }
    free(s);free(prefix);return 0;
}
