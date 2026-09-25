import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.Arrays;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        int lines=Integer.parseInt(input.readLine().trim());
        int[] count=new int[26];
        for(int i=0;i<lines;++i) {
            String text=input.readLine().toUpperCase();
            for(int j=0;j<text.length();++j) {
                char ch=text.charAt(j);
                if(ch>='A' && ch<='Z') ++count[ch-'A'];
            }
        }
        Integer[] order=new Integer[26];
        for(int i=0;i<26;++i) order[i]=i;
        Arrays.sort(order,(a,b)->count[a]!=count[b] ? Integer.compare(count[b],count[a]) : Integer.compare(a,b));
        StringBuilder output=new StringBuilder();
        for(int i:order) if(count[i]>0) output.append((char)('A'+i)).append(' ').append(count[i]).append('\n');
        System.out.print(output);
    }
}
