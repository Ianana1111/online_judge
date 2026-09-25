import java.util.Arrays;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            int count = input.nextInt();
            int[] positions = new int[count];
            for (int i = 0; i < count; ++i) positions[i] = input.nextInt();
            Arrays.sort(positions);
            int home = positions[count / 2];
            long total = 0;
            for (int position : positions) total += Math.abs(position - home);
            output.append(total).append('\n');
        }
        System.out.print(output);
    }
}
