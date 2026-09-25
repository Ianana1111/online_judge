import java.util.HashMap;
import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);
        int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        for(int tc=1;tc<=tests;++tc) {
            int n=input.nextInt();
            HashMap<String,Integer> days=new HashMap<>();
            for(int i=0;i<n;++i) days.put(input.next(),input.nextInt());
            int deadline=input.nextInt();
            int finish=days.getOrDefault(input.next(),1000000000);
            String result=finish<=deadline ? "Yesss" : finish<=deadline+5 ? "Late" : "Do your own homework!";
            output.append("Case ").append(tc).append(": ").append(result).append('\n');
        }
        System.out.print(output);
    }
}
