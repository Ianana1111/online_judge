#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define MAX_NODES 40001
typedef struct { char name[9]; int child, sibling; } Node;
static Node nodes[MAX_NODES];
static int count;
static int child_named(int parent, const char *name) {
    for (int u = nodes[parent].child; u; u = nodes[u].sibling)
        if (strcmp(nodes[u].name, name) == 0) return u;
    int u = ++count;
    strcpy(nodes[u].name, name);
    nodes[u].child = 0;
    nodes[u].sibling = nodes[parent].child;
    nodes[parent].child = u;
    return u;
}
static int compare_nodes(const void *a, const void *b) {
    int x = *(const int *)a, y = *(const int *)b;
    return strcmp(nodes[x].name, nodes[y].name);
}
static void print_tree(int parent, int depth) {
    int children[500], n = 0;
    for (int u = nodes[parent].child; u; u = nodes[u].sibling) children[n++] = u;
    qsort(children, n, sizeof(int), compare_nodes);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < depth; j++) putchar(' ');
        puts(nodes[children[i]].name);
        print_tree(children[i], depth + 1);
    }
}
int main(void) {
    int paths;
    while (scanf("%d", &paths) == 1) {
        count = 0; nodes[0].child = 0;
        for (int i = 0; i < paths; i++) {
            char path[81]; scanf("%80s", path);
            int parent = 0;
            char *part = strtok(path, "\\");
            while (part) { parent = child_named(parent, part); part = strtok(NULL, "\\"); }
        }
        print_tree(0, 0);
        putchar('\n');
    }
    return 0;
}
