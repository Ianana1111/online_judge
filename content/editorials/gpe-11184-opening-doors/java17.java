import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.util.StringTokenizer;
public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder out = new StringBuilder();
        for (String line; (line=input.readLine()) != null;) {
            StringTokenizer words = new StringTokenizer(line);
            while (words.hasMoreTokens()) {
                BigInteger number = new BigInteger(words.nextToken());
                if (number.signum() == 0) { System.out.print(out); return; }
                BigInteger root = number.sqrt(); out.append(root.multiply(root)).append('\n');
            }
        }
        System.out.print(out);
    }
}
