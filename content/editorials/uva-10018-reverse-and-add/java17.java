import java.util.Scanner;
class Main {
    static long reverse(long value) {
        long answer=0;
        while(value>0) {answer=answer*10+value%10;value/=10;}
        return answer;
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        while(tests-->0) {
            long value=input.nextLong(); int count=0;
            do {value+=reverse(value);++count;} while(value!=reverse(value));
            output.append(count).append(' ').append(value).append('\n');
        }
        System.out.print(output);
    }
}
