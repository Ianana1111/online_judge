import java.io.*;
import java.util.*;
public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder out = new StringBuilder();
        String line; int n = 0; int[] correct = null;
        while ((line = reader.readLine()) != null) {
            StringTokenizer tokens = new StringTokenizer(line);
            int count = tokens.countTokens(); if (count == 0) continue;
            int[] ranking = new int[count];
            for (int i = 0; i < count; i++) ranking[i] = Integer.parseInt(tokens.nextToken());
            if (count == 1) { n = ranking[0]; correct = null; continue; }
            if (correct == null) { correct = ranking; continue; }
            int[] sequence = new int[n], dp = new int[n];
            for (int event = 0; event < n; event++) sequence[ranking[event] - 1] = correct[event];
            int best = 1;
            for (int i = 0; i < n; i++) {
                dp[i] = 1;
                for (int j = 0; j < i; j++) if (sequence[j] < sequence[i])
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                best = Math.max(best, dp[i]);
            }
            out.append(best).append('\n');
        }
        System.out.print(out);
    }
}
