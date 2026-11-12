import java.io.DataInputStream;
import java.io.IOException;
import java.util.Arrays;

class Main {
    static DataInputStream in = new DataInputStream(System.in);
    static byte[] buffer = new byte[1 << 16];
    static int length = 0, pos = 0;
    static int[] count;
    static boolean[] used;
    static int n;

    static int read() throws IOException {
        if (pos == length) {
            length = in.read(buffer, 0, buffer.length);
            pos = 0;
            if (length <= 0) return -1;
        }
        return buffer[pos++];
    }

    static int nextNonSpace() throws IOException {
        int c = read();
        while (c == ' ' || c == '\n' || c == '\r' || c == '\t') c = read();
        return c;
    }

    static int nextInt() throws IOException {
        int c = nextNonSpace(), value = 0;
        while (c >= '0' && c <= '9') { value = value * 10 + (c - '0'); c = read(); }
        return value;
    }

    static int take(int a, int b) {
        for (int w = 0; w < n; ++w)
            if (!used[w] && (count[w] == a || count[w] == b)) { used[w] = true; return w; }
        return -1;
    }

    public static void main(String[] args) throws IOException {
        StringBuilder out = new StringBuilder();
        int cases = nextInt();
        while (cases-- > 0) {
            n = nextInt();
            count = new int[n];
            used = new boolean[n];
            for (int c = nextNonSpace(); c != -1 && c != '#'; c = nextNonSpace())
                if (c >= 'A' && c < 'A' + n) ++count[c - 'A'];
            int[] ranked = count.clone();
            Arrays.sort(ranked);
            for (int i = 0, j = n - 1; i < j; ++i, --j) { int t = ranked[i]; ranked[i] = ranked[j]; ranked[j] = t; }
            int[] order = new int[n], rightNeed = new int[n / 2];
            for (int k = 0; k < n / 2; ++k) {
                int a = ranked[2 * k], b = ranked[2 * k + 1];
                int w = take(a, b);
                order[k] = w;
                rightNeed[k] = count[w] == a ? b : a;
            }
            if (n % 2 == 1) order[n / 2] = take(ranked[n - 1], ranked[n - 1]);
            for (int k = n / 2 - 1; k >= 0; --k) order[n - 1 - k] = take(rightNeed[k], rightNeed[k]);
            for (int i = 0; i < n; ++i) out.append((char) ('A' + order[i])).append(i + 1 == n ? '\n' : ' ');
            for (int i = 0; i < n; ++i) out.append(count[order[i]]).append(i + 1 == n ? '\n' : ' ');
        }
        System.out.print(out);
    }
}
