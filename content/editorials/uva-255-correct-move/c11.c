#include <stdio.h>
#include <stdlib.h>
static int can_reach(int from, int to, int king) {
    if (from == to || to == king) return 0;
    int low = from < to ? from : to, high = from > to ? from : to;
    if (from / 8 == to / 8) {
        if (king / 8 == from / 8 && low < king && king < high) return 0;
        return 1;
    }
    if (from % 8 == to % 8) {
        if (king % 8 == from % 8 && low < king && king < high) return 0;
        return 1;
    }
    return 0;
}
int main(void) {
    int king, queen, destination;
    while (scanf("%d %d %d", &king, &queen, &destination) == 3) {
        if (king == queen) { puts("Illegal state"); continue; }
        if (!can_reach(queen, destination, king)) { puts("Illegal move"); continue; }
        int kr = king / 8, kc = king % 8, qr = destination / 8, qc = destination % 8;
        if (abs(kr - qr) + abs(kc - qc) == 1) { puts("Move not allowed"); continue; }
        int dr[4] = {-1,1,0,0}, dc[4] = {0,0,-1,1}, escape = 0;
        for (int i = 0; i < 4; i++) {
            int r = kr + dr[i], c = kc + dc[i];
            if (r < 0 || r >= 8 || c < 0 || c >= 8) continue;
            int next = r * 8 + c;
            if (next != destination && !can_reach(destination, next, king)) escape = 1;
        }
        puts(escape ? "Continue" : "Stop");
    }
    return 0;
}
