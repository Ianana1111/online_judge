import java.util.HashSet;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();int tc=0;
        while(input.hasNextInt()) {
            int n=input.nextInt(),answer=0;
            while(n-->0) {
                String word=input.next();int[] count=new int[26];
                for(int i=0;i<word.length();++i) ++count[word.charAt(i)-'a'];
                HashSet<Integer> frequencies=new HashSet<>();int distinct=0;boolean unique=true;
                for(int value:count) if(value>0) {++distinct;if(!frequencies.add(value)) unique=false;}
                if(distinct>=2 && unique) ++answer;
            }
            output.append("Case ").append(++tc).append(": ").append(answer).append('\n');
        }
        System.out.print(output);
    }
}
