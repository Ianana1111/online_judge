#include <stdio.h>
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        int card[5][5]={0},called[76]={0};
        for(int r=0;r<5;++r) for(int c=0;c<5;++c)
            if(r!=2 || c!=2) scanf("%d",&card[r][c]);
        for(int time=1;time<=75;++time) {
            int number;scanf("%d",&number);called[number]=time;
        }
        int answer=75,diagonal1=0,diagonal2=0;
        for(int r=0;r<5;++r) {
            int row=0,column=0;
            for(int c=0;c<5;++c) {
                if(called[card[r][c]]>row) row=called[card[r][c]];
                if(called[card[c][r]]>column) column=called[card[c][r]];
            }
            if(row<answer) answer=row;if(column<answer) answer=column;
            if(called[card[r][r]]>diagonal1) diagonal1=called[card[r][r]];
            if(called[card[r][4-r]]>diagonal2) diagonal2=called[card[r][4-r]];
        }
        if(diagonal1<answer) answer=diagonal1;
        if(diagonal2<answer) answer=diagonal2;
        printf("BINGO after %d numbers announced\n",answer);
    }
    return 0;
}
