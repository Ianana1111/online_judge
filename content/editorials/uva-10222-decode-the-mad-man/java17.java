import java.io.BufferedReader;
import java.io.InputStreamReader;
class Main {
    public static void main(String[] args) throws Exception {
        String[] rows={"`1234567890-=", "qwertyuiop[]\\", "asdfghjkl;'", "zxcvbnm,./"};
        char[] decode=new char[256];
        for(String row:rows) for(int i=2;i<row.length();++i) decode[row.charAt(i)]=row.charAt(i-2);
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        int cases=Integer.parseInt(input.readLine().trim());
        StringBuilder output=new StringBuilder();
        for(int tc=0;tc<cases;++tc) {
            String line=input.readLine();
            for(int i=0;i<line.length();++i) {
                char ch=line.charAt(i), lower=Character.toLowerCase(ch);
                output.append(lower<256 && decode[lower]!=0 ? decode[lower] : ch);
            }
            output.append('\n');
        }
        System.out.print(output);
    }
}
