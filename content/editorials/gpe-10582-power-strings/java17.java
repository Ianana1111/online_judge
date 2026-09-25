import java.io.BufferedReader;
import java.io.InputStreamReader;
class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
        StringBuilder output=new StringBuilder();String s;
        while((s=input.readLine())!=null && !s.equals(".")) {
            int n=s.length();int[] prefix=new int[n];
            for(int i=1;i<n;++i) {
                int length=prefix[i-1];
                while(length>0 && s.charAt(i)!=s.charAt(length)) length=prefix[length-1];
                if(s.charAt(i)==s.charAt(length)) ++length;
                prefix[i]=length;
            }
            int period=n-prefix[n-1];
            output.append(n%period==0?n/period:1).append('\n');
        }
        System.out.print(output);
    }
}
