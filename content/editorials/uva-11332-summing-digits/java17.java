import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextLong()) {
            long value = input.nextLong();
            if (value == 0) break;
            while (value >= 10) {
                long sum = 0;
                while (value > 0) {
                    sum += value % 10;
                    value /= 10;
                }
                value = sum;
            }
            output.append(value).append('\n');
        }
        System.out.print(output);
    }
}
