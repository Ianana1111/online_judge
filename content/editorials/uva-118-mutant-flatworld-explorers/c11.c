#include <stdio.h>
#include <string.h>
int main(void) {
    int max_x,max_y;scanf("%d %d",&max_x,&max_y);
    unsigned char scent[51][51]={0};const char *directions="NESW";
    const int dx[4]={0,1,0,-1},dy[4]={1,0,-1,0};
    int x,y;char heading;
    while(scanf("%d %d %c",&x,&y,&heading)==3) {
        char instructions[101];
        int ch=getchar();while(ch!='\n' && ch!=EOF) ch=getchar();
        if(!fgets(instructions,sizeof(instructions),stdin)) instructions[0]='\0';
        instructions[strcspn(instructions,"\r\n")]='\0';
        int direction=(int)(strchr(directions,heading)-directions),lost=0;
        for(int i=0;instructions[i];++i) {
            char command=instructions[i];
            if(command=='L') direction=(direction+3)%4;
            else if(command=='R') direction=(direction+1)%4;
            else {
                int nx=x+dx[direction],ny=y+dy[direction];
                if(nx<0||nx>max_x||ny<0||ny>max_y) {
                    if(!scent[x][y]) {scent[x][y]=1;lost=1;break;}
                } else {x=nx;y=ny;}
            }
        }
        printf("%d %d %c%s\n",x,y,directions[direction],lost?" LOST":"");
    }
    return 0;
}
