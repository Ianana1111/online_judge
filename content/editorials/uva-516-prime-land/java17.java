import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input = new BufferedReader(new InputStreamReader(System.in));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = input.readLine()) != null) {
            StringTokenizer tokens = new StringTokenizer(line);
            if (!tokens.hasMoreTokens()) continue;
            int prime = Integer.parseInt(tokens.nextToken());
            if (prime == 0) break;
            int number = 1;
            do {
                int exponent = Integer.parseInt(tokens.nextToken());
                for (int i = 0; i < exponent; i++) number *= prime;
                if (!tokens.hasMoreTokens()) break;
                prime = Integer.parseInt(tokens.nextToken());
            } while (true);
            int rest = number - 1;
            List<int[]> factors = new ArrayList<>();
            for (int divisor = 2; divisor * divisor <= rest; divisor++) {
                int exponent = 0;
                while (rest % divisor == 0) {
                    rest /= divisor;
                    exponent++;
                }
                if (exponent > 0) factors.add(new int[] {divisor, exponent});
            }
            if (rest > 1) factors.add(new int[] {rest, 1});
            for (int i = factors.size() - 1; i >= 0; i--) {
                if (i != factors.size() - 1) output.append(' ');
                output.append(factors.get(i)[0]).append(' ').append(factors.get(i)[1]);
            }
            output.append('\n');
        }
        System.out.print(output);
    }
}
