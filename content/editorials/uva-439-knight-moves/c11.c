#include <stdio.h>
int main(void) {
    const int dx[8]={1,1,-1,-1,2,2,-2,-2},dy[8]={2,-2,2,-2,1,-1,1,-1};
    char from[3],to[3];
    while(scanf("%2s %2s",from,to)==2) {
        int start=(from[0]-'a')*8+from[1]-'1',target=(to[0]-'a')*8+to[1]-'1';
        int distance[64],queue[64],head=0,tail=0;
        for(int i=0;i<64;++i) distance[i]=-1;
        distance[start]=0;queue[tail++]=start;
        while(head<tail) {
            int at=queue[head++],x=at/8,y=at%8;
            for(int move=0;move<8;++move) {
                int nx=x+dx[move],ny=y+dy[move];
                if(nx<0||nx>=8||ny<0||ny>=8) continue;
                int next=nx*8+ny;
                if(distance[next]>=0) continue;
                distance[next]=distance[at]+1;queue[tail++]=next;
            }
        }
        printf("To get from %s to %s takes %d knight moves.\n",from,to,distance[target]);
    }
    return 0;
}
