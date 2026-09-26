public class Main {

    static class Input {
        private final byte[] buffer = new byte[65536];
        private int at, size;
        int read() throws Exception {
            if (at == size) { size = System.in.read(buffer); at = 0; }
            return size < 0 ? -1 : buffer[at++];
        }
        long next() throws Exception {
            int c; do { c = read(); } while (c >= 0 && c <= 32);
            if (c < 0) return Long.MIN_VALUE;
            boolean negative = c == '-'; if (negative) c = read();
            long value = 0;
            while (c > 32) { value = value * 10 + c - '0'; c = read(); }
            return negative ? -value : value;
        }
    }

    public static void main(String[] args) throws Exception {
        Input in = new Input();
        int tests = (int)in.next(); StringBuilder out = new StringBuilder();
        while (tests-- > 0) {
            int rows = (int)in.next(), cols = (int)in.next(), cells = rows * cols, start = -1;
            byte[] board = new byte[cells];
            for (int i = 0; i < cells; i++) {
                int ch; do { ch = in.read(); } while (ch <= 32 && ch >= 0);
                board[i] = (byte)ch; if (ch == 'S') start = i;
            }
            int[] distance = new int[3 * cells], queue = new int[3 * cells];
            java.util.Arrays.fill(distance, -1);
            int head = 0, tail = 0, answer = -1; queue[tail++] = 3 * start; distance[3 * start] = 0;
            int[] dr = {1, -1, 0, 0}, dc = {0, 0, 1, -1};
            while (head < tail) {
                int state = queue[head++], node = state / 3, phase = state % 3;
                if (board[node] == 'E') { answer = distance[state]; break; }
                for (int direction = 0; direction < 4; direction++) {
                    int r = node / cols, c = node % cols; boolean valid = true;
                    for (int step = 0; step <= phase; step++) {
                        r += dr[direction]; c += dc[direction];
                        if (r < 0 || r >= rows || c < 0 || c >= cols || board[r * cols + c] == '#') { valid = false; break; }
                    }
                    if (!valid) continue;
                    int next = 3 * (r * cols + c) + (phase + 1) % 3;
                    if (distance[next] < 0) { distance[next] = distance[state] + 1; queue[tail++] = next; }
                }
            }
            if (answer < 0) out.append("NO\n"); else out.append(answer).append('\n');
        }
        System.out.print(out);
    }
}
