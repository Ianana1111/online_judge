#include <stdio.h>
#include <string.h>
char preorder[1001],inorder[1001],answer[1001];int at;
void visit(int pre_start,int left,int right) {
    if(left==right) return;
    char root=preorder[pre_start];int split=left;
    while(inorder[split]!=root) ++split;
    visit(pre_start+1,left,split);
    visit(pre_start+1+split-left,split+1,right);
    answer[at++]=root;
}
int main(void) {
    int tests;scanf("%d",&tests);
    while(tests--) {
        int n;scanf("%d",&n);
        for(int i=0;i<n;++i) scanf(" %c",&preorder[i]);
        for(int i=0;i<n;++i) scanf(" %c",&inorder[i]);
        at=0;visit(0,0,n);
        for(int i=0;i<n;++i) printf("%s%c",i?" ":"",answer[i]);
        putchar('\n');
    }
    return 0;
}
