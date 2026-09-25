import java.util.Arrays;
import java.util.HashMap;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);StringBuilder output=new StringBuilder();
        while(input.hasNextInt()) {
            int n=input.nextInt();if(n==0) break;
            HashMap<String,Integer> count=new HashMap<>();
            for(int i=0;i<n;++i) {
                int[] courses=new int[5];for(int j=0;j<5;++j) courses[j]=input.nextInt();
                Arrays.sort(courses);String key=Arrays.toString(courses);
                count.put(key,count.getOrDefault(key,0)+1);
            }
            int best=0,answer=0;
            for(int frequency:count.values()) best=Math.max(best,frequency);
            for(int frequency:count.values()) if(frequency==best) answer+=frequency;
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
