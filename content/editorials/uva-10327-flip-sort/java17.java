import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int n = input.nextInt();
            long[] values = new long[n];
            for (int i = 0; i < n; ++i) values[i] = input.nextLong();
            long inversions = 0;
            for (int i = 0; i < n; ++i)
                for (int j = i + 1; j < n; ++j)
                    if (values[i] > values[j]) ++inversions;
            output.append("Minimum exchange operations : ").append(inversions).append('\n');
        }
        System.out.print(output);
    }
}
