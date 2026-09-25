import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        StringBuilder answers = new StringBuilder();
        while (input.hasNext()) {
            String number = input.next();
            if (number.equals("0")) break;
            int remainder = 0;
            for (int i = 0; i < number.length(); ++i)
                remainder = (remainder * 10 + number.charAt(i) - '0') % 11;
            answers.append(number).append(remainder == 0
                ? " is a multiple of 11.\n" : " is not a multiple of 11.\n");
        }
        System.out.print(answers);
    }
}
