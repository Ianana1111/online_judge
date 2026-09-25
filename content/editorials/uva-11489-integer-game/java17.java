import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in); int tests=input.nextInt();
        StringBuilder output=new StringBuilder();
        for(int tc=1;tc<=tests;++tc) {
            String digits=input.next(); int[] count=new int[3]; int residue=0;
            for(int i=0;i<digits.length();++i) {
                int r=(digits.charAt(i)-'0')%3;
                ++count[r]; residue=(residue+r)%3;
            }
            boolean wins=count[residue]>0 && (count[0]-(residue==0?1:0))%2==0;
            output.append("Case ").append(tc).append(": ").append(wins?'S':'T').append('\n');
        }
        System.out.print(output);
    }
}
