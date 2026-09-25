#include <stdio.h>
#include <stdlib.h>
int main(void) {
    int n;
    while(scanf("%d",&n)==1 && n) {
        int *rows=calloc((size_t)n,sizeof(int)),*columns=calloc((size_t)n,sizeof(int));
        for(int r=0;r<n;++r) for(int c=0;c<n;++c) {
            int bit;scanf("%d",&bit);rows[r]^=bit;columns[c]^=bit;
        }
        int odd_rows=0,odd_cols=0,row=0,col=0;
        for(int i=0;i<n;++i) {
            if(rows[i]) {++odd_rows;row=i+1;}
            if(columns[i]) {++odd_cols;col=i+1;}
        }
        if(odd_rows==0 && odd_cols==0) puts("OK");
        else if(odd_rows==1 && odd_cols==1) printf("Change bit (%d,%d)\n",row,col);
        else puts("Corrupt");
        free(rows);free(columns);
    }
    return 0;
}
