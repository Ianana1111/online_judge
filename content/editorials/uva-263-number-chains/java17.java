import java.util.Arrays;
import java.util.HashSet;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNextLong()) {
            long original=input.nextLong();if(original==0) break;
            output.append("Original number was ").append(original).append('\n');
            HashSet<Long> seen=new HashSet<>();seen.add(original);
            long current=original;int length=0;
            while(true) {
                char[] digits=Long.toString(current).toCharArray();Arrays.sort(digits);
                long low=Long.parseLong(new String(digits));
                for(int i=0;i<digits.length/2;++i) {
                    char temp=digits[i];digits[i]=digits[digits.length-1-i];digits[digits.length-1-i]=temp;
                }
                long high=Long.parseLong(new String(digits)),next=high-low;++length;
                output.append(high).append(" - ").append(low).append(" = ").append(next).append('\n');
                if(!seen.add(next)) break;
                current=next;
            }
            output.append("Chain length ").append(length).append("\n\n");
        }
        System.out.print(output);
    }
}
