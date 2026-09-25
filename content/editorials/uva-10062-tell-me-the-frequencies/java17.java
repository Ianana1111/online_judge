import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        StringBuilder output=new StringBuilder(); String line; boolean first=true;
        while((line=input.readLine())!=null) {
            int[] count=new int[128];
            for(int i=0;i<line.length();++i) if(line.charAt(i)<128) ++count[line.charAt(i)];
            ArrayList<Integer> codes=new ArrayList<>();
            for(int ch=32;ch<128;++ch) if(count[ch]>0) codes.add(ch);
            codes.sort((a,b)->count[a]!=count[b] ? Integer.compare(count[a],count[b]) : Integer.compare(b,a));
            if(!first) output.append('\n'); first=false;
            for(int ch:codes) output.append(ch).append(' ').append(count[ch]).append('\n');
        }
        System.out.print(output);
    }
}
