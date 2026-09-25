import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        int tests=Integer.parseInt(input.readLine().trim());
        StringBuilder output=new StringBuilder();
        while(tests-->0) {
            String[] tokens=input.readLine().trim().split("\\s+");
            ArrayList<Integer> weights=new ArrayList<>(); int total=0;
            for(String token:tokens) if(!token.isEmpty()) {int weight=Integer.parseInt(token);weights.add(weight);total+=weight;}
            if(total%2==1) {output.append("NO\n");continue;}
            int target=total/2; boolean[] reachable=new boolean[target+1]; reachable[0]=true;
            for(int weight:weights) for(int amount=target;amount>=weight;--amount)
                if(reachable[amount-weight]) reachable[amount]=true;
            output.append(reachable[target]?"YES\n":"NO\n");
        }
        System.out.print(output);
    }
}
