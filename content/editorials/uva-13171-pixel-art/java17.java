import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input = new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens = new StringTokenizer("");
    static String next() throws Exception { while (!tokens.hasMoreTokens()) tokens = new StringTokenizer(input.readLine()); return tokens.nextToken(); }
    static int mask(char color) {
        switch (color) { case 'M': return 1; case 'Y': return 2; case 'C': return 4; case 'R': return 3; case 'B': return 7; case 'G': return 6; case 'V': return 5; default: return 0; }
    }
    public static void main(String[] args) throws Exception {
        int tests = Integer.parseInt(next()); StringBuilder out = new StringBuilder();
        while (tests-- > 0) {
            BigInteger[] stock = {new BigInteger(next()), new BigInteger(next()), new BigInteger(next())};
            String picture = next(); int[] need = new int[3];
            for (int p = 0; p < picture.length(); p++) { int bits = mask(picture.charAt(p)); for (int i = 0; i < 3; i++) if ((bits & (1 << i)) != 0) need[i]++; }
            boolean possible = true;
            for (int i = 0; i < 3; i++) { stock[i] = stock[i].subtract(BigInteger.valueOf(need[i])); if (stock[i].signum() < 0) possible = false; }
            if (!possible) out.append("NO\n"); else out.append("YES ").append(stock[0]).append(' ').append(stock[1]).append(' ').append(stock[2]).append('\n');
        }
        System.out.print(out);
    }
}
