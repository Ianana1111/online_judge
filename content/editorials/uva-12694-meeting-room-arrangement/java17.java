import java.util.ArrayList;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        while(tests-->0) {
            ArrayList<int[]> events=new ArrayList<>();
            while(true) {
                int start=input.nextInt(),finish=input.nextInt();
                if(start==0 && finish==0) break;
                events.add(new int[]{start,finish});
            }
            events.sort((a,b)->Integer.compare(a[1],b[1]));
            int end=0,answer=0;
            for(int[] event:events) if(event[0]>=end) {++answer;end=event[1];}
            output.append(answer).append('\n');
        }
        System.out.print(output);
    }
}
