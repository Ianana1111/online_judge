import java.util.Arrays;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            if (n == 0) break;
            String[] values = new String[n];
            for (int i = 0; i < n; ++i) values[i] = input.next();
            Arrays.sort(values, (a, b) -> (b + a).compareTo(a + b));
            for (String value : values) output.append(value);
            output.append('\n');
        }
        System.out.print(output);
    }
}
