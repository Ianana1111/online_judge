import java.util.Arrays;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            int[] values = new int[n];
            for (int i = 0; i < n; ++i) values[i] = input.nextInt();
            Arrays.sort(values);
            int low = values[(n - 1) / 2], high = values[n / 2];
            int count = 0;
            for (int value : values) if (value >= low && value <= high) ++count;
            output.append(low).append(' ').append(count).append(' ')
                  .append(high - low + 1).append('\n');
        }
        System.out.print(output);
    }
}
