#include <stdio.h>
int main(void) {
    int tests;scanf("%d",&tests);
    for(int tc=0;tc<tests;++tc) {
        int n;scanf("%d",&n);char board[20][21],touch[20][21];
        for(int r=0;r<n;++r) scanf("%20s",board[r]);
        for(int r=0;r<n;++r) scanf("%20s",touch[r]);
        int lost=0;
        for(int r=0;r<n;++r) for(int c=0;c<n;++c)
            if(board[r][c]=='*' && touch[r][c]=='x') lost=1;
        if(tc) putchar('\n');
        for(int r=0;r<n;++r) {
            for(int c=0;c<n;++c) {
                if(lost && board[r][c]=='*') {putchar('*');continue;}
                if(touch[r][c]!='x') {putchar('.');continue;}
                int count=0;
                for(int dr=-1;dr<=1;++dr) for(int dc=-1;dc<=1;++dc) if(dr||dc) {
                    int nr=r+dr,nc=c+dc;
                    if(nr>=0 && nr<n && nc>=0 && nc<n && board[nr][nc]=='*') ++count;
                }
                putchar('0'+count);
            }
            putchar('\n');
        }
    }
    return 0;
}
