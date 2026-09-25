#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        int rows,cols,queries;scanf("%d %d %d",&rows,&cols,&queries);
        char **grid=malloc((size_t)rows*sizeof(char*));
        for(int r=0;r<rows;++r) {grid[r]=malloc((size_t)cols+1);scanf("%s",grid[r]);}
        printf("%d %d %d\n",rows,cols,queries);
        while(queries--) {
            int r,c;scanf("%d %d",&r,&c);
            int limit=r;if(c<limit) limit=c;
            if(rows-1-r<limit) limit=rows-1-r;
            if(cols-1-c<limit) limit=cols-1-c;
            int radius=0;
            for(int next=1;next<=limit;++next) {
                int good=1;
                for(int offset=-next;offset<=next;++offset)
                    if(grid[r-next][c+offset]!=grid[r][c] || grid[r+next][c+offset]!=grid[r][c] ||
                       grid[r+offset][c-next]!=grid[r][c] || grid[r+offset][c+next]!=grid[r][c]) good=0;
                if(!good) break;
                radius=next;
            }
            printf("%d\n",2*radius+1);
        }
        for(int r=0;r<rows;++r) free(grid[r]);free(grid);
    }
    return 0;
}
