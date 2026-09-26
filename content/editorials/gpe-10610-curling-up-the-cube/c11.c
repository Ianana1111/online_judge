#include <stdio.h>
#include <string.h>
int main(void){
    int tests;scanf("%d",&tests);
    for(int test=0;test<tests;test++){
        int board[36],frame[36][3]={{0}},queue[36],start=0;
        for(int i=0;i<36;i++){scanf("%d",&board[i]);if(board[i])start=i;}
        frame[start][0]=1;frame[start][1]=2;frame[start][2]=3;
        int front=0,back=0,valid=1,normal[7]={0},distinct=0;queue[back++]=start;
        int dr[4]={0,0,1,-1},dc[4]={1,-1,0,0};
        while(front<back){
            int at=queue[front++],r=at/6,c=at%6,u=frame[at][0],v=frame[at][1],n=frame[at][2];
            if(!normal[n+3]){normal[n+3]=1;distinct++;}
            for(int direction=0;direction<4;direction++){
                int rr=r+dr[direction],cc=c+dc[direction];if(rr<0||rr>=6||cc<0||cc>=6)continue;
                int next=rr*6+cc;if(!board[next])continue;
                int turned[3];
                if(direction==0){turned[0]=-n;turned[1]=v;turned[2]=u;}
                else if(direction==1){turned[0]=n;turned[1]=v;turned[2]=-u;}
                else if(direction==2){turned[0]=u;turned[1]=-n;turned[2]=v;}
                else{turned[0]=u;turned[1]=n;turned[2]=-v;}
                if(frame[next][0]){for(int axis=0;axis<3;axis++)if(frame[next][axis]!=turned[axis])valid=0;}
                else{memcpy(frame[next],turned,sizeof(turned));queue[back++]=next;}
            }
        }
        if(test)putchar('\n');puts(valid&&back==6&&distinct==6?"correct":"incorrect");
    }
    return 0;
}
