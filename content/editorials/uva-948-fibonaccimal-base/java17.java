import java.util.ArrayList;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        ArrayList<Integer> fib=new ArrayList<>(); fib.add(1); fib.add(2);
        while(fib.get(fib.size()-1)<100000000) fib.add(fib.get(fib.size()-1)+fib.get(fib.size()-2));
        Scanner input=new Scanner(System.in); int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int original=input.nextInt(), remaining=original;
            StringBuilder digits=new StringBuilder();
            for(int i=fib.size()-1;i>=0;--i) {
                if(fib.get(i)<=remaining) {digits.append('1');remaining-=fib.get(i);}
                else if(digits.length()>0) digits.append('0');
            }
            output.append(original).append(" = ").append(digits).append(" (fib)\n");
        }
        System.out.print(output);
    }
}
