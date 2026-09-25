import java.io.BufferedReader;
import java.io.InputStreamReader;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        int tests=Integer.parseInt(input.readLine().trim());StringBuilder output=new StringBuilder();
        for(int tc=1;tc<=tests;++tc) {
            if(tc>1) output.append('\n');
            output.append("Case #").append(tc).append(":\n");
            boolean started=false;String line;
            while((line=input.readLine())!=null) {
                StringBuilder decoded=new StringBuilder();
                for(String word:line.trim().split("\\s+"))
                    if(word.length()>decoded.length()) decoded.append(word.charAt(decoded.length()));
                if(decoded.length()==0) {if(started) break;continue;}
                started=true;output.append(decoded).append('\n');
            }
        }
        System.out.print(output);
    }
}
