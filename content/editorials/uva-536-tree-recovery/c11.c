#include <stdio.h>
#include <string.h>
static char preorder[27], inorder[27], answer[27];
static int position[26], next_root, answer_size;
static void build(int left, int right) {
    if (left >= right) return;
    char root = preorder[next_root++];
    int middle = position[root - 'A'];
    build(left, middle);
    build(middle + 1, right);
    answer[answer_size++] = root;
}
int main(void) {
    while (scanf("%26s %26s", preorder, inorder) == 2) {
        int length = strlen(inorder);
        for (int i = 0; i < length; i++) position[inorder[i] - 'A'] = i;
        next_root = answer_size = 0;
        build(0, length);
        answer[answer_size] = 0;
        puts(answer);
    }
    return 0;
}
