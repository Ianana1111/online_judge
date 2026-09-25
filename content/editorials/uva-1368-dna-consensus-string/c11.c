#include <stdio.h>
#include <stdlib.h>
int index_of(char ch) {
    if(ch=='A') return 0;if(ch=='C') return 1;if(ch=='G') return 2;return 3;
}
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        int m,n;scanf("%d %d",&m,&n);
        char **dna=malloc((size_t)m*sizeof(char*));
        for(int i=0;i<m;++i) {dna[i]=malloc((size_t)n+1);scanf("%s",dna[i]);}
        char *answer=malloc((size_t)n+1);int errors=0;const char *alphabet="ACGT";
        for(int col=0;col<n;++col) {
            int count[4]={0};
            for(int row=0;row<m;++row) ++count[index_of(dna[row][col])];
            int best=0;for(int i=1;i<4;++i) if(count[i]>count[best]) best=i;
            answer[col]=alphabet[best];errors+=m-count[best];
        }
        answer[n]='\0';printf("%s\n%d\n",answer,errors);
        for(int i=0;i<m;++i) free(dna[i]);free(dna);free(answer);
    }
    return 0;
}
