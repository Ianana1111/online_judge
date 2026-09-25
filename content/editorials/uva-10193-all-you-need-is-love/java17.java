import java.util.Scanner;

class Main {
    static int gcd(int a, int b) {
        while (b != 0) { int remainder = a % b; a = b; b = remainder; }
        return a;
    }
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 1; caseNumber <= tests; ++caseNumber) {
            int first = Integer.parseInt(input.next(), 2);
            int second = Integer.parseInt(input.next(), 2);
            boolean possible = gcd(first, second) > 1;
            output.append("Pair #").append(caseNumber).append(": ")
                  .append(possible ? "All you need is love!\n" : "Love is not all you need!\n");
        }
        System.out.print(output);
    }
}
