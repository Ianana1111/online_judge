import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 1; caseNumber <= tests; ++caseNumber) {
            int n = input.nextInt();
            int previous = input.nextInt();
            int high = 0, low = 0;
            for (int i = 1; i < n; ++i) {
                int current = input.nextInt();
                if (current > previous) ++high;
                else if (current < previous) ++low;
                previous = current;
            }
            output.append("Case ").append(caseNumber).append(": ")
                  .append(high).append(' ').append(low).append('\n');
        }
        System.out.print(output);
    }
}
