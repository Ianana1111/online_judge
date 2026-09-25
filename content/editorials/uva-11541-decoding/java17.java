import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        for(int tc=1;tc<=tests;++tc) {
            String encoded=input.next();output.append("Case ").append(tc).append(": ");
            for(int i=0;i<encoded.length();) {
                char letter=encoded.charAt(i++);int count=0;
                while(i<encoded.length() && Character.isDigit(encoded.charAt(i)))
                    count=count*10+encoded.charAt(i++)-'0';
                for(int j=0;j<count;++j) output.append(letter);
            }
            output.append('\n');
        }
        System.out.print(output);
    }
}
