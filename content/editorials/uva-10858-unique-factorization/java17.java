import java.io.*;
import java.util.*;
public class Main {
    static class FastScanner {
        private final InputStream in = System.in;
        private final byte[] buf = new byte[1 << 16];
        private int ptr, len;
        int read() throws IOException {
            if (ptr >= len) { len = in.read(buf); ptr = 0; if (len < 0) return -1; }
            return buf[ptr++];
        }
        int nextInt() throws IOException {
            int c; do { c = read(); } while (c <= 32 && c >= 0);
            if (c < 0) return -1;
            int x = 0;
            while (c > 32 && c >= 0) { x = x * 10 + c - '0'; c = read(); }
            return x;
        }
    }
    static ArrayList<int[]> answers;
    static int[] path = new int[21];
    static void search(int rest, int minimum, int depth) {
        for (int divisor = minimum; divisor * divisor <= rest; divisor++) if (rest % divisor == 0) {
            path[depth] = divisor;
            search(rest / divisor, divisor, depth + 1);
        }
        if (depth > 0 && rest >= minimum) {
            int[] answer = Arrays.copyOf(path, depth + 1);
            answer[depth] = rest; answers.add(answer);
        }
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        int n;
        while ((n = fs.nextInt()) > 0) {
            answers = new ArrayList<>(); search(n, 2, 0);
            answers.sort((a, b) -> {
                for (int i = 0; i < Math.min(a.length, b.length); i++)
                    if (a[i] != b[i]) return Integer.compare(a[i], b[i]);
                return Integer.compare(a.length, b.length);
            });
            out.append(answers.size()).append('\n');
            for (int[] answer : answers) {
                for (int i = 0; i < answer.length; i++) {
                    if (i > 0) out.append(' ');
                    out.append(answer[i]);
                }
                out.append('\n');
            }
        }
        System.out.print(out);
    }
}
