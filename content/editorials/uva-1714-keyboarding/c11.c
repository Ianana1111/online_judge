#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int main(void){
    int rows,columns;
    while(scanf("%d%d",&rows,&columns)==2){
        int size=rows*columns,move[2500][4],degree[2500]={0};char board[2500],line[51],text[10002];
        for(int r=0;r<rows;r++){scanf("%50s",line);memcpy(board+r*columns,line,columns);}scanf("%10000s",text);int length=(int)strlen(text);text[length++]='*';text[length]='\0';
        int dr[4]={1,-1,0,0},dc[4]={0,0,1,-1};
        for(int r=0;r<rows;r++)for(int c=0;c<columns;c++)for(int d=0;d<4;d++){
            int rr=r+dr[d],cc=c+dc[d],at=r*columns+c;
            while(rr>=0&&rr<rows&&cc>=0&&cc<columns&&board[rr*columns+cc]==board[at]){rr+=dr[d];cc+=dc[d];}
            if(rr>=0&&rr<rows&&cc>=0&&cc<columns)move[at][degree[at]++]=rr*columns+cc;
        }
        unsigned char *seen=(unsigned char*)calloc((size_t)size*(length+1),1);
        int *frontier=(int*)malloc(size*sizeof(int)),*following=(int*)malloc(size*sizeof(int)),count=1,steps=0,answer=-1;frontier[0]=0;seen[0]=1;
        while(count&&answer<0){
            int next_count=0;
            for(int i=0;i<count;i++){
                int state=frontier[i],progress=state/size,cell=state%size;if(progress==length){answer=steps;break;}
                if(board[cell]==text[progress]){int next=state+size;if(!seen[next]){seen[next]=1;following[next_count++]=next;}}
                int base=state-cell;
                for(int d=0;d<degree[cell];d++){int next=base+move[cell][d];if(!seen[next]){seen[next]=1;following[next_count++]=next;}}
            }
            int *swap=frontier;frontier=following;following=swap;count=next_count;steps++;
        }
        printf("%d\n",answer);free(seen);free(frontier);free(following);
    }
    return 0;
}
