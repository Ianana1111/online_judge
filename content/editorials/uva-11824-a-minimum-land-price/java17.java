import java.util.ArrayList;
import java.util.Collections;
import java.util.Scanner;
class Main {
    static final long BUDGET=5000000;
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        while(tests-->0) {
            ArrayList<Long> prices=new ArrayList<>();String token;
            while(!(token=input.next()).equals("0")) {
                long price=0;
                for(int i=0;i<token.length();++i) {
                    int digit=token.charAt(i)-'0';
                    if(price>(BUDGET+1-digit)/10) price=BUDGET+1;
                    else price=price*10+digit;
                    if(price>BUDGET+1) price=BUDGET+1;
                }
                prices.add(price);
            }
            prices.sort(Collections.reverseOrder());
            long total=0;boolean expensive=false;
            for(int i=0;i<prices.size();++i) {
                long price=prices.get(i),power=1;
                for(int exponent=0;exponent<=i;++exponent) {
                    if(power>BUDGET/2/price) {expensive=true;break;}
                    power*=price;
                }
                if(expensive || total+2*power>BUDGET) {expensive=true;break;}
                total+=2*power;
            }
            output.append(expensive?"Too expensive":Long.toString(total)).append('\n');
        }
        System.out.print(output);
    }
}
