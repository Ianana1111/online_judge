import java.io.*;
public class Main {
    static class FastScanner {
        private final InputStream in = System.in;
        private final byte[] buf = new byte[1 << 16];
        private int ptr, len;
        int read() throws IOException {
            if (ptr >= len) { len = in.read(buf); ptr = 0; if (len < 0) return -1; }
            return buf[ptr++];
        }
        String next() throws IOException {
            int c; do { c = read(); } while (c <= 32 && c >= 0);
            if (c < 0) return null;
            StringBuilder s = new StringBuilder();
            while (c > 32 && c >= 0) { s.append((char)c); c = read(); }
            return s.toString();
        }
    }
    static String preorder;
    static int[] position;
    static int nextRoot;
    static void build(int left, int right, StringBuilder answer) {
        if (left >= right) return;
        char root = preorder.charAt(nextRoot++);
        int middle = position[root - 'A'];
        build(left, middle, answer);
        build(middle + 1, right, answer);
        answer.append(root);
    }
    public static void main(String[] args) throws Exception {
        FastScanner fs = new FastScanner(); StringBuilder out = new StringBuilder();
        String inorder;
        while ((preorder = fs.next()) != null) {
            inorder = fs.next(); position = new int[26];
            for (int i = 0; i < inorder.length(); i++) position[inorder.charAt(i) - 'A'] = i;
            nextRoot = 0; StringBuilder answer = new StringBuilder();
            build(0, inorder.length(), answer);
            out.append(answer).append('\n');
        }
        System.out.print(out);
    }
}
