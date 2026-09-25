import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        int n=Integer.parseInt(input.readLine().trim());
        HashMap<String,String> responses=new HashMap<>();
        for(int i=0;i<n;++i) responses.put(input.readLine(),input.readLine());
        int queries=Integer.parseInt(input.readLine().trim());
        StringBuilder output=new StringBuilder();
        for(int i=0;i<queries;++i) output.append(responses.get(input.readLine())).append('\n');
        System.out.print(output);
    }
}
