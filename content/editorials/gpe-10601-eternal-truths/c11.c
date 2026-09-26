#include <stdio.h>
#include <stdlib.h>
int main(void){
    int tests;scanf("%d",&tests);
    while(tests--){
        int rows,cols;scanf("%d%d",&rows,&cols);int cells=rows*cols,start=-1;
        char *board=malloc(cells),*line=malloc(cols+1);
        for(int r=0;r<rows;r++){scanf("%s",line);for(int c=0;c<cols;c++){board[r*cols+c]=line[c];if(line[c]=='S')start=r*cols+c;}}
        int *distance=malloc(3*cells*sizeof(int)),*queue=malloc(3*cells*sizeof(int));
        for(int i=0;i<3*cells;i++)distance[i]=-1;
        int head=0,tail=0,answer=-1;queue[tail++]=3*start;distance[3*start]=0;
        int dr[4]={1,-1,0,0},dc[4]={0,0,1,-1};
        while(head<tail){
            int state=queue[head++],node=state/3,phase=state%3;
            if(board[node]=='E'){answer=distance[state];break;}
            for(int direction=0;direction<4;direction++){
                int r=node/cols,c=node%cols,valid=1;
                for(int step=0;step<=phase;step++){
                    r+=dr[direction];c+=dc[direction];
                    if(r<0||r>=rows||c<0||c>=cols||board[r*cols+c]=='#'){valid=0;break;}
                }
                if(!valid)continue;
                int next=3*(r*cols+c)+(phase+1)%3;
                if(distance[next]<0){distance[next]=distance[state]+1;queue[tail++]=next;}
            }
        }
        if(answer<0)puts("NO");else printf("%d\n",answer);
        free(board);free(line);free(distance);free(queue);
    }
    return 0;
}
