import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextLong()) {
            long a = input.nextLong(), b = input.nextLong();
            if (a == 0 && b == 0) break;
            int carry = 0, operations = 0;
            while (a != 0 || b != 0) {
                int sum = (int)(a % 10 + b % 10) + carry;
                carry = sum >= 10 ? 1 : 0;
                operations += carry;
                a /= 10;
                b /= 10;
            }
            if (operations == 0) output.append("No carry operation.\n");
            else output.append(operations).append(" carry operation")
                       .append(operations == 1 ? ".\n" : "s.\n");
        }
        System.out.print(output);
    }
}
