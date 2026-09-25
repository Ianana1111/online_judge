import java.util.Scanner;
class Main {
    public static void main(String[] args) {
        Scanner input=new Scanner(System.in);int tests=input.nextInt();StringBuilder output=new StringBuilder();
        for(int tc=0;tc<tests;++tc) {
            int n=input.nextInt();String[] board=new String[n],touch=new String[n];
            for(int r=0;r<n;++r) board[r]=input.next();
            for(int r=0;r<n;++r) touch[r]=input.next();
            boolean lost=false;
            for(int r=0;r<n;++r) for(int c=0;c<n;++c)
                if(board[r].charAt(c)=='*' && touch[r].charAt(c)=='x') lost=true;
            if(tc>0) output.append('\n');
            for(int r=0;r<n;++r) {
                for(int c=0;c<n;++c) {
                    if(lost && board[r].charAt(c)=='*') {output.append('*');continue;}
                    if(touch[r].charAt(c)!='x') {output.append('.');continue;}
                    int count=0;
                    for(int dr=-1;dr<=1;++dr) for(int dc=-1;dc<=1;++dc) if(dr!=0 || dc!=0) {
                        int nr=r+dr,nc=c+dc;
                        if(nr>=0 && nr<n && nc>=0 && nc<n && board[nr].charAt(nc)=='*') ++count;
                    }
                    output.append(count);
                }
                output.append('\n');
            }
        }
        System.out.print(output);
    }
}
