import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        int tests = input.nextInt();
        StringBuilder output = new StringBuilder();
        for (int caseNumber = 1; caseNumber <= tests; ++caseNumber) {
            long n = input.nextLong();
            StringBuilder digits = new StringBuilder();
            do {
                int bit = (int)((n % 2 + 2) % 2);
                digits.append(bit);
                n = (n - bit) / -2;
            } while (n != 0);
            output.append("Case #").append(caseNumber).append(": ")
                  .append(digits.reverse()).append('\n');
        }
        System.out.print(output);
    }
}
