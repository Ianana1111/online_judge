import java.io.BufferedInputStream;
import java.io.IOException;

class Main {
    private static final BufferedInputStream IN = new BufferedInputStream(System.in);
    private static String next() throws IOException {
        int c;
        do { c = IN.read(); } while (c <= ' ' && c != -1);
        if (c == -1) return null;
        StringBuilder word = new StringBuilder();
        while (c > ' ') {
            word.append((char)c);
            c = IN.read();
        }
        return word.toString();
    }

    public static void main(String[] args) throws Exception {
        int[][] rates = {
            {10, 6, 2}, {25, 15, 5}, {53, 33, 13},
            {87, 47, 17}, {144, 80, 30}
        };
        StringBuilder output = new StringBuilder();
        String plan;
        while ((plan = next()) != null && !plan.equals("#")) {
            String phone = next();
            int sh = Integer.parseInt(next()), sm = Integer.parseInt(next());
            int eh = Integer.parseInt(next()), em = Integer.parseInt(next());
            int start = sh * 60 + sm, finish = eh * 60 + em;
            if (finish <= start) finish += 1440;
            int[] minutes = new int[3];
            for (int t = start; t < finish; t++) {
                int clock = t % 1440;
                int period = clock >= 480 && clock < 1080 ? 0
                           : clock >= 1080 && clock < 1320 ? 1 : 2;
                minutes[period]++;
            }
            int cents = 0;
            for (int i = 0; i < 3; i++) cents += minutes[i] * rates[plan.charAt(0) - 'A'][i];
            String price = (cents / 100) + "." + (cents % 100 < 10 ? "0" : "") + (cents % 100);
            output.append(String.format("%10s%6d%6d%6d%3s%8s%n", phone,
                         minutes[0], minutes[1], minutes[2], plan, price));
        }
        System.out.print(output);
    }
}
