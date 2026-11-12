import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.PriorityQueue;
import java.util.StringTokenizer;

class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        ArrayList<Long> numbers = new ArrayList<>();
        String line;
        while ((line = in.readLine()) != null) {
            StringTokenizer tokens = new StringTokenizer(line);
            while (tokens.hasMoreTokens()) numbers.add(Long.parseLong(tokens.nextToken()));
        }
        int n = numbers.size() / 2;
        long[][] turtles = new long[n][];
        for (int k = 0; k < n; ++k) turtles[k] = new long[] {numbers.get(2 * k + 1), numbers.get(2 * k)};
        java.util.Arrays.sort(turtles, (x, y) -> x[0] != y[0] ? Long.compare(x[0], y[0]) : Long.compare(x[1], y[1]));
        PriorityQueue<Long> stack = new PriorityQueue<>(Collections.reverseOrder());
        long total = 0;
        for (long[] turtle : turtles) {
            stack.add(turtle[1]);
            total += turtle[1];
            if (total > turtle[0]) total -= stack.poll();
        }
        System.out.println(stack.size());
    }
}
