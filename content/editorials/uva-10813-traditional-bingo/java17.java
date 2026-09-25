import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        while(tests-->0) {
            int[][] card=new int[5][5];int[] called=new int[76];
            for(int r=0;r<5;++r) for(int c=0;c<5;++c)
                if(r!=2 || c!=2) card[r][c]=input.nextInt();
            for(int time=1;time<=75;++time) called[input.nextInt()]=time;
            int answer=75,diagonal1=0,diagonal2=0;
            for(int r=0;r<5;++r) {
                int row=0,column=0;
                for(int c=0;c<5;++c) {
                    row=Math.max(row,called[card[r][c]]);
                    column=Math.max(column,called[card[c][r]]);
                }
                answer=Math.min(answer,Math.min(row,column));
                diagonal1=Math.max(diagonal1,called[card[r][r]]);
                diagonal2=Math.max(diagonal2,called[card[r][4-r]]);
            }
            answer=Math.min(answer,Math.min(diagonal1,diagonal2));
            output.append("BINGO after ").append(answer).append(" numbers announced\n");
        }
        System.out.print(output);
    }
}
