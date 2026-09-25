import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int n=input.nextInt();String token=input.next();int chosen=input.nextInt();
            boolean positive=false;
            for(int i=0;i<token.length() && token.charAt(i)!='e' && token.charAt(i)!='E';++i)
                if(token.charAt(i)>='1' && token.charAt(i)<='9') positive=true;
            double result=0;
            if(positive) {
                double p=Double.parseDouble(token),q=1-p,weight=1,total=0,target=0;
                for(int player=1;player<=n;++player) {
                    total+=weight;if(player==chosen) target=weight;
                    weight*=q;
                }
                result=target/total;
            }
            output.append(String.format(java.util.Locale.US,"%.4f\n",result));
        }
        System.out.print(output);
    }
}
