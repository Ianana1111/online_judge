#include <stdio.h>
#include <string.h>
int main(void) {
    int tests;scanf("%d",&tests);
    int ch=getchar();while(ch!='\n' && ch!=EOF) ch=getchar();
    char program[100001];
    for(int tc=1;tc<=tests;++tc) {
        if(!fgets(program,sizeof(program),stdin)) program[0]='\0';
        unsigned char memory[100]={0};int pointer=0;
        for(size_t i=0;program[i];++i) {
            char command=program[i];
            if(command=='>') pointer=(pointer+1)%100;
            else if(command=='<') pointer=(pointer+99)%100;
            else if(command=='+') ++memory[pointer];
            else if(command=='-') --memory[pointer];
        }
        printf("Case %d:",tc);
        for(int i=0;i<100;++i) printf(" %02X",memory[i]);
        putchar('\n');
    }
    return 0;
}
