import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.TreeMap;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        int n=Integer.parseInt(input.readLine().trim());
        TreeMap<String,Integer> counts=new TreeMap<>();
        for(int i=0;i<n;++i) {
            String line=input.readLine().trim();
            String country=line.split("\\s+",2)[0];
            counts.put(country,counts.getOrDefault(country,0)+1);
        }
        StringBuilder output=new StringBuilder();
        for(var entry:counts.entrySet()) output.append(entry.getKey()).append(' ').append(entry.getValue()).append('\n');
        System.out.print(output);
    }
}
