import java.util.Locale;
import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNextInt()) {
            int digits = input.nextInt();
            long base = 1;
            for (int i = 0; i < digits / 2; ++i) base *= 10;
            for (long root = 0; root < base; ++root) {
                long value = root * root;
                if (value / base + value % base == root)
                    output.append(String.format(Locale.US, "%0" + digits + "d%n", value));
            }
        }
        System.out.print(output);
    }
}
