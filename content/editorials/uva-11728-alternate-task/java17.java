import java.util.Arrays;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        int[] sum = new int[1001];
        int[] largest = new int[1001];
        Arrays.fill(largest, -1);
        for (int divisor = 1; divisor <= 1000; ++divisor)
            for (int multiple = divisor; multiple <= 1000; multiple += divisor)
                sum[multiple] += divisor;
        for (int n = 1; n <= 1000; ++n)
            if (sum[n] <= 1000) largest[sum[n]] = n;
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        int caseNumber = 0;
        while (input.hasNextInt()) {
            int target = input.nextInt();
            if (target == 0) break;
            output.append("Case ").append(++caseNumber).append(": ")
                  .append(largest[target]).append('\n');
        }
        System.out.print(output);
    }
}
