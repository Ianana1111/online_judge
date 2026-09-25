#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int tests; scanf("%d",&tests);
    int ch=getchar(); while(ch!='\n' && ch!=EOF) ch=getchar();
    char line[2000];
    while(tests--) {
        if(!fgets(line,sizeof(line),stdin)) break;
        int weights[100],count=0,total=0;
        char *cursor=line,*end;
        while(1) {
            long value=strtol(cursor,&end,10);
            if(cursor==end) break;
            weights[count++]=(int)value; total+=(int)value; cursor=end;
        }
        if(total%2) {puts("NO");continue;}
        int target=total/2;
        unsigned char *reachable=calloc((size_t)target+1,1); reachable[0]=1;
        for(int i=0;i<count;++i)
            for(int sum=target;sum>=weights[i];--sum)
                if(reachable[sum-weights[i]]) reachable[sum]=1;
        puts(reachable[target]?"YES":"NO");
        free(reachable);
    }
    return 0;
}
