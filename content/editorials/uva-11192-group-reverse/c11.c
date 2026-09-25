#include <stdio.h>
#include <string.h>

int main(void) {
    int groups;
    char text[1000001];
    while (scanf("%d", &groups) == 1 && groups != 0) {
        scanf("%1000000s", text);
        int length = (int)strlen(text);
        int size = length / groups;
        for (int start = 0; start < length; start += size) {
            for (int left = start, right = start + size - 1; left < right; ++left, --right) {
                char temp = text[left];
                text[left] = text[right];
                text[right] = temp;
            }
        }
        puts(text);
    }
    return 0;
}
