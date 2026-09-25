import java.io.BufferedInputStream;
import java.util.Arrays;

class Main {
    static final BufferedInputStream input = new BufferedInputStream(System.in);

    static int nextInt() throws Exception {
        int ch;
        do { ch = input.read(); } while (ch <= 32 && ch != -1);
        if (ch == -1) return -1;
        int value = 0;
        while (ch > 32 && ch != -1) {
            value = value * 10 + ch - '0';
            ch = input.read();
        }
        return value;
    }

    static long pair(int from, int to) {
        return ((long) from << 32) | (to & 0xffffffffL);
    }

    public static void main(String[] args) throws Exception {
        StringBuilder output = new StringBuilder();
        int n;
        while ((n = nextInt()) > 0) {
            long[] forward = new long[n];
            long[] backward = new long[n];
            for (int i = 0; i < n; ++i) {
                int from = nextInt(), to = nextInt();
                forward[i] = pair(from, to);
                backward[i] = pair(to, from);
            }
            Arrays.sort(forward);
            Arrays.sort(backward);
            output.append(Arrays.equals(forward, backward) ? "YES\n" : "NO\n");
        }
        System.out.print(output);
    }
}
