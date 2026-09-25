import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.TreeMap;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        int tests=Integer.parseInt(input.readLine().trim());StringBuilder output=new StringBuilder();
        for(int tc=0;tc<tests;++tc) {
            TreeMap<String,Long> counts=new TreeMap<>();long total=0;String line;
            while((line=input.readLine())!=null) {
                if(line.isEmpty()) {if(total>0) break;continue;}
                counts.put(line,counts.getOrDefault(line,0L)+1);++total;
            }
            if(tc>0) output.append('\n');
            for(var entry:counts.entrySet()) {
                long scaled=(entry.getValue()*1000000+total/2)/total;
                output.append(entry.getKey()).append(' ').append(scaled/10000).append('.');
                String fraction=Long.toString(scaled%10000);
                for(int i=fraction.length();i<4;++i) output.append('0');
                output.append(fraction).append('\n');
            }
        }
        System.out.print(output);
    }
}
