import java.util.HashSet;
import java.util.Scanner;
class Main {
    static int nextValue(int value) {
        int total=0;
        while(value>0) {int digit=value%10;total+=digit*digit;value/=10;}
        return total;
    }
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        for(int tc=1;tc<=tests;++tc) {
            int original=input.nextInt(),value=original;
            HashSet<Integer> seen=new HashSet<>();
            while(value!=1 && seen.add(value)) value=nextValue(value);
            output.append("Case #").append(tc).append(": ").append(original)
                  .append(value==1?" is a Happy number.\n":" is an Unhappy number.\n");
        }
        System.out.print(output);
    }
}
