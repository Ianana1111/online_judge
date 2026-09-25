import java.util.Scanner;

class Main {
    public static void main(String[] args) {
        String key = "22233344455566677778889999";
        Scanner input = new Scanner(System.in);
        StringBuilder output = new StringBuilder();
        while (input.hasNext()) {
            String text = input.next();
            int letters = 0, hyphens = 0;
            for (int i = 0; i < text.length(); ++i) {
                char ch = text.charAt(i);
                if (ch >= 'A' && ch <= 'Z') {
                    ++letters;
                    output.append(key.charAt(ch - 'A'));
                } else {
                    if (ch == '-') ++hyphens;
                    output.append(ch);
                }
            }
            output.append(' ').append(letters).append(' ').append(hyphens).append('\n');
        }
        System.out.print(output);
    }
}
