import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 0; caseNumber < tests; ++caseNumber) {
            int n = input.nextInt();
            int[] cars = new int[n];
            for (int i = 0; i < n; ++i) cars[i] = input.nextInt();
            int swaps = 0;
            for (int i = 0; i < n; ++i) {
                for (int j = i + 1; j < n; ++j) {
                    if (cars[i] > cars[j]) ++swaps;
                }
            }
            output.append("Optimal train swapping takes ").append(swaps).append(" swaps.\n");
        }
        System.out.print(output);
    }
}
