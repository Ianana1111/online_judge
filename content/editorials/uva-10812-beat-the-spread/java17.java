import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.StringTokenizer;
public class Main {
    static BufferedReader input = new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer tokens = new StringTokenizer("");
    static String next() throws Exception {
        while (!tokens.hasMoreTokens()) tokens = new StringTokenizer(input.readLine());
        return tokens.nextToken();
    }
    public static void main(String[] args) throws Exception {
        int tests = Integer.parseInt(next()); StringBuilder out = new StringBuilder();
        while (tests-- > 0) {
            BigInteger total = new BigInteger(next()), difference = new BigInteger(next());
            if (total.compareTo(difference) < 0 || total.testBit(0) != difference.testBit(0)) out.append("impossible\n");
            else out.append(total.add(difference).shiftRight(1)).append(' ').append(total.subtract(difference).shiftRight(1)).append('\n');
        }
        System.out.print(out);
    }
}
