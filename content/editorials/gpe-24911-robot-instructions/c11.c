#include <stdio.h>
#include <string.h>
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        int n;scanf("%d",&n);int movement[1001]={0},position=0;
        for(int i=1;i<=n;++i) {
            char command[16];scanf("%15s",command);
            if(strcmp(command,"LEFT")==0) movement[i]=-1;
            else if(strcmp(command,"RIGHT")==0) movement[i]=1;
            else {
                char as[16];int previous;scanf("%15s %d",as,&previous);
                movement[i]=movement[previous];
            }
            position+=movement[i];
        }
        printf("%d\n",position);
    }
    return 0;
}
