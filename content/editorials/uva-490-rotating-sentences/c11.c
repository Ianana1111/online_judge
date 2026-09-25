#include <stdio.h>
#include <stdlib.h>
#include <string.h>
int main(void) {
    char line[1001],lines[101][1001];int count=0;size_t width=0;
    while(fgets(line,sizeof(line),stdin)) {
        size_t length=strlen(line);
        while(length && (line[length-1]=='\n' || line[length-1]=='\r')) line[--length]='\0';
        strcpy(lines[count++],line);if(length>width) width=length;
    }
    for(size_t column=0;column<width;++column) {
        for(int row=count-1;row>=0;--row)
            putchar(column<strlen(lines[row])?lines[row][column]:' ');
        putchar('\n');
    }
    return 0;
}
