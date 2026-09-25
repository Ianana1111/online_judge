import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextLong()) {
            long base = input.nextLong(), exponent = input.nextLong(), modulus = input.nextLong();
            base %= modulus;
            long result = 1 % modulus;
            while (exponent > 0) {
                if ((exponent & 1) != 0) result = result * base % modulus;
                base = base * base % modulus;
                exponent >>= 1;
            }
            output.append(result).append('\n');
        }
        System.out.print(output);
    }
}
