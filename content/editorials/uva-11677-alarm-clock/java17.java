import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        while (input.hasNextInt()) {
            int h1 = input.nextInt();
            int m1 = input.nextInt();
            int h2 = input.nextInt();
            int m2 = input.nextInt();
            if (h1 == 0 && m1 == 0 && h2 == 0 && m2 == 0) break;
            int wait = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (wait <= 0) wait += 1440;
            System.out.println(wait);
        }
    }
}
