import java.io.BufferedReader;
import java.io.InputStreamReader;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        int tests=Integer.parseInt(input.readLine().trim());StringBuilder output=new StringBuilder();
        for(int tc=0;tc<tests;++tc) {
            String line;
            do {line=input.readLine();} while(line.trim().isEmpty());
            String[] positions=line.trim().split("\\s+");
            String[] values=input.readLine().trim().split("\\s+");
            String[] answer=new String[positions.length];
            for(int i=0;i<positions.length;++i) answer[Integer.parseInt(positions[i])-1]=values[i];
            if(tc>0) output.append('\n');
            for(String word:answer) output.append(word).append('\n');
        }
        System.out.print(output);
    }
}
