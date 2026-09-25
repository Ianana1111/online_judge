import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextLong()) {
            long a = input.nextLong(), b = input.nextLong(), c = input.nextLong();
            long divisor = input.nextLong(), limit = input.nextLong();
            if (a == 0 && b == 0 && c == 0 && divisor == 0 && limit == 0) break;
            int answer = 0;
            for (long x = 0; x <= limit; ++x) {
                long value = (a * x + b) * x + c;
                if (value % divisor == 0) ++answer;
            }
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
