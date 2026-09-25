import java.io.BufferedInputStream;
import java.io.IOException;

class Main {
    private static final BufferedInputStream IN = new BufferedInputStream(System.in);
    private static long nextLong() throws IOException {
        int c;
        do { c = IN.read(); } while (c <= ' ' && c != -1);
        boolean negative = false;
        if (c == '-') { negative = true; c = IN.read(); }
        long value = 0;
        while (c > ' ') { value = value * 10 + c - '0'; c = IN.read(); }
        return negative ? -value : value;
    }
    private static long cross(long ax, long ay, long bx, long by) {
        return ax * by - ay * bx;
    }
    private static String formatRatio(long numerator, long denominator) {
        if (denominator < 0) { numerator = -numerator; denominator = -denominator; }
        long rounded = (2 * Math.abs(numerator) * 100 + denominator) / (2 * denominator);
        return (numerator < 0 && rounded != 0 ? "-" : "")
             + (rounded / 100) + "." + (rounded % 100 < 10 ? "0" : "") + (rounded % 100);
    }
    public static void main(String[] args) throws Exception {
        int cases = (int)nextLong();
        StringBuilder output = new StringBuilder("INTERSECTING LINES OUTPUT\n");
        for (int i = 0; i < cases; i++) {
            long x1 = nextLong(), y1 = nextLong(), x2 = nextLong(), y2 = nextLong();
            long x3 = nextLong(), y3 = nextLong(), x4 = nextLong(), y4 = nextLong();
            long ux = x2 - x1, uy = y2 - y1, vx = x4 - x3, vy = y4 - y3;
            long dx = x3 - x1, dy = y3 - y1;
            long denominator = cross(ux, uy, vx, vy);
            if (denominator == 0) {
                output.append(cross(dx, dy, ux, uy) == 0 ? "LINE\n" : "NONE\n");
            } else {
                long fraction = cross(dx, dy, vx, vy);
                output.append("POINT ")
                      .append(formatRatio(x1 * denominator + ux * fraction, denominator)).append(' ')
                      .append(formatRatio(y1 * denominator + uy * fraction, denominator)).append('\n');
            }
        }
        output.append("END OF OUTPUT\n");
        System.out.print(output);
    }
}
