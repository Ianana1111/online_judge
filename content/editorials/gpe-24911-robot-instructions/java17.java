import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int n=input.nextInt();int[] movement=new int[n+1];int position=0;
            for(int i=1;i<=n;++i) {
                String command=input.next();
                if(command.equals("LEFT")) movement[i]=-1;
                else if(command.equals("RIGHT")) movement[i]=1;
                else {input.next();movement[i]=movement[input.nextInt()];}
                position+=movement[i];
            }
            output.append(position).append('\n');
        }
        System.out.print(output);
    }
}
